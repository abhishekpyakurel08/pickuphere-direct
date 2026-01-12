import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ThumbsUp, ThumbsDown, Camera, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { reviewsApi, ReviewData } from '@/services/api';
import { subscribeToProduct, unsubscribeFromProduct, onNewReview, onHelpfulUpdate } from '@/services/socket';

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

export default function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingBreakdown, setRatingBreakdown] = useState<Record<number, number>>({});
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'highest' | 'lowest'>('recent');
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { toast } = useToast();

  // New review form state
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: '',
  });
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const data = await reviewsApi.getByProduct(productId, { sort: sortBy });
        setReviews(data.reviews || []);
        setAverageRating(data.averageRating || 0);
        setTotalReviews(data.totalReviews || 0);
        setRatingBreakdown(data.ratingBreakdown || {});
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [productId, sortBy]);

  // Socket subscriptions for real-time updates
  useEffect(() => {
    subscribeToProduct(productId);

    const unsubNewReview = onNewReview((review) => {
      if (review.productId === productId) {
        setReviews((prev) => [review, ...prev]);
        setTotalReviews((prev) => prev + 1);
      }
    });

    const unsubHelpful = onHelpfulUpdate((data) => {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === data.reviewId ? { ...r, helpfulCount: data.helpfulCount } : r
        )
      );
    });

    return () => {
      unsubscribeFromProduct(productId);
      unsubNewReview();
      unsubHelpful();
    };
  }, [productId]);

  // Handle submit review
  const handleSubmitReview = async () => {
    if (!newReview.title.trim() || !newReview.comment.trim()) {
      toast({
        title: 'Please fill all fields',
        description: 'Title and comment are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      if (reviewImages.length > 0) {
        const formData = new FormData();
        formData.append('productId', productId);
        formData.append('rating', String(newReview.rating));
        formData.append('title', newReview.title);
        formData.append('comment', newReview.comment);
        reviewImages.forEach((img) => formData.append('images', img));
        await reviewsApi.createWithImages(formData);
      } else {
        await reviewsApi.create({
          productId,
          rating: newReview.rating,
          title: newReview.title,
          comment: newReview.comment,
        });
      }

      toast({
        title: 'Review submitted!',
        description: 'Thank you for your feedback',
      });

      setNewReview({ rating: 5, title: '', comment: '' });
      setReviewImages([]);
      setShowReviewForm(false);
    } catch (error: any) {
      toast({
        title: 'Failed to submit review',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle helpful vote
  const handleHelpful = async (reviewId: string, isHelpful: boolean) => {
    try {
      await reviewsApi.markHelpful(reviewId, isHelpful);
    } catch (error: any) {
      toast({
        title: 'Failed to vote',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Star rating component
  const StarRating = ({ rating, size = 16, interactive = false, onChange }: {
    rating: number;
    size?: number;
    interactive?: boolean;
    onChange?: (rating: number) => void;
  }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={`${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'} ${
            interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''
          }`}
          onClick={() => interactive && onChange?.(star)}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Customer Reviews</h2>
          <div className="flex items-center gap-3 mt-2">
            <StarRating rating={Math.round(averageRating)} size={20} />
            <span className="text-lg font-semibold">{averageRating.toFixed(1)}</span>
            <span className="text-muted-foreground">({totalReviews} reviews)</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="helpful">Most Helpful</SelectItem>
              <SelectItem value="highest">Highest Rated</SelectItem>
              <SelectItem value="lowest">Lowest Rated</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={() => setShowReviewForm(!showReviewForm)}>
            Write a Review
          </Button>
        </div>
      </div>

      {/* Rating breakdown */}
      <div className="bg-muted/30 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingBreakdown[star] || 0;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="w-8 text-sm">{star}★</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-12 text-sm text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review form */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border rounded-lg p-4 space-y-4"
          >
            <h3 className="font-semibold">Write your review for {productName}</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Rating</label>
              <StarRating
                rating={newReview.rating}
                size={28}
                interactive
                onChange={(rating) => setNewReview((prev) => ({ ...prev, rating }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="Summary of your review"
                value={newReview.title}
                onChange={(e) => setNewReview((prev) => ({ ...prev, title: e.target.value }))}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Your Review</label>
              <Textarea
                placeholder="Share your experience with this product..."
                value={newReview.comment}
                onChange={(e) => setNewReview((prev) => ({ ...prev, comment: e.target.value }))}
                rows={4}
                maxLength={1000}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Add Photos (optional)</label>
              <div className="flex flex-wrap gap-2">
                {reviewImages.map((img, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={URL.createObjectURL(img)}
                      alt={`Review image ${idx + 1}`}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <button
                      onClick={() => setReviewImages((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-5 h-5 text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {reviewImages.length < 5 && (
                  <label className="w-20 h-20 border-2 border-dashed rounded flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <Camera className="text-muted-foreground" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setReviewImages((prev) => [...prev, e.target.files![0]]);
                        }
                      }}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmitReview} disabled={isSubmitting}>
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
              <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse space-y-3">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-3 bg-muted rounded w-1/6" />
                </div>
              </div>
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-b pb-6 last:border-b-0"
            >
              <div className="flex gap-3">
                <Avatar>
                  <AvatarImage src={review.user?.picture} />
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{review.user?.name || 'Anonymous'}</span>
                    {review.isVerifiedPurchase && (
                      <Badge variant="secondary" className="text-xs">Verified Purchase</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={review.rating} size={14} />
                    <span className="text-sm text-muted-foreground">
                      {review.createdAt
                        ? new Date(review.createdAt).toLocaleDateString()
                        : 'Recently'}
                    </span>
                  </div>
                </div>
              </div>

              <h4 className="font-semibold mt-3">{review.title}</h4>
              <p className="text-muted-foreground mt-1">{review.comment}</p>

              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mt-3 overflow-x-auto">
                  {review.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Review image ${idx + 1}`}
                      className="w-24 h-24 object-cover rounded cursor-pointer hover:opacity-80"
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 mt-3">
                <span className="text-sm text-muted-foreground">Was this helpful?</span>
                <button
                  onClick={() => handleHelpful(review.id!, true)}
                  className="flex items-center gap-1 text-sm hover:text-primary transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{review.helpfulCount || 0}</span>
                </button>
                <button
                  onClick={() => handleHelpful(review.id!, false)}
                  className="flex items-center gap-1 text-sm hover:text-destructive transition-colors"
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
