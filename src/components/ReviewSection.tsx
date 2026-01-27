import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, MessageSquare, Image as ImageIcon, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

interface Review {
    _id: string;
    user: {
        _id: string;
        name: string;
    };
    rating: number;
    comment: string;
    images: string[];
    createdAt: string;
}

interface ReviewSectionProps {
    productId: string;
}

export function ReviewSection({ productId }: ReviewSectionProps) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [hoveredRating, setHoveredRating] = useState(0);

    const { data: reviews = [], isLoading } = useQuery({
        queryKey: ['reviews', productId],
        queryFn: async () => {
            const res = await api.get(`/reviews/${productId}`);
            return res.data as Review[];
        }
    });

    const mutation = useMutation({
        mutationFn: async (newReview: { rating: number; comment: string }) => {
            return api.post(`/reviews/${productId}`, newReview);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
            toast.success('Review submitted successfully!');
            setComment('');
            setRating(5);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to submit review');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error('Please sign in to leave a review');
            return;
        }
        if (comment.trim().length < 5) {
            toast.error('Review must be at least 5 characters long');
            return;
        }
        mutation.mutate({ rating, comment });
    };

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : '4.8';

    const displayCount = reviews.length > 0 ? reviews.length : 120;

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between border-b pb-8">
                <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Customer Reviews</h2>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                    key={s}
                                    className={`w-5 h-5 ${Number(averageRating) >= s ? 'fill-accent text-accent' : 'text-muted'}`}
                                />
                            ))}
                        </div>
                        <span className="text-lg font-bold">{averageRating} out of 5</span>
                        <span className="text-muted-foreground">({displayCount} reviews)</span>
                    </div>
                </div>

                {user ? (
                    <Button
                        variant="outline"
                        onClick={() => document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' })}
                        className="rounded-xl border-2"
                    >
                        Write a Review
                    </Button>
                ) : (
                    <p className="text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg">
                        Please sign in to share your hunt experience.
                    </p>
                )}
            </div>

            <div className="grid lg:grid-cols-3 gap-12">
                {/* Reviews List */}
                <div className="lg:col-span-2 space-y-6">
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : reviews.length > 0 ? (
                        reviews.map((review, index) => (
                            <motion.div
                                key={review._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-6 rounded-2xl bg-muted/30 border border-border/50"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="font-bold text-foreground">{review.user.name}</p>
                                        <div className="flex items-center gap-1 mt-1">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star
                                                    key={s}
                                                    className={`w-3 h-3 ${review.rating >= s ? 'fill-accent text-accent' : 'text-muted'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {format(new Date(review.createdAt), 'MMM d, yyyy')}
                                    </span>
                                </div>
                                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                    {review.comment}
                                </p>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-muted/20 rounded-3xl border-2 border-dashed">
                            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground font-medium">No reviews yet. Be the first to review!</p>
                        </div>
                    )}
                </div>

                {/* Submit Review Form */}
                <div className="lg:col-span-1">
                    {user && (
                        <div id="review-form" className="card-elevated p-6 sticky top-24">
                            <h3 className="text-lg font-bold mb-6">Leave a Review</h3>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="text-sm font-medium mb-3 block">Rating</label>
                                    <div className="flex items-center gap-2">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onMouseEnter={() => setHoveredRating(s)}
                                                onMouseLeave={() => setHoveredRating(0)}
                                                onClick={() => setRating(s)}
                                                className="transition-transform hover:scale-125 focus:outline-none"
                                            >
                                                <Star
                                                    className={`w-8 h-8 ${(hoveredRating || rating) >= s
                                                        ? 'fill-accent text-accent'
                                                        : 'text-muted'
                                                        }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-3 block">Your Experience</label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Tell us about the flavor, packaging or delivery..."
                                        className="input-field min-h-[120px] resize-none"
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={mutation.isPending}
                                    className="w-full btn-gradient-primary h-12 rounded-xl"
                                >
                                    {mutation.isPending ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Submit Review
                                            <Send className="w-4 h-4 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
