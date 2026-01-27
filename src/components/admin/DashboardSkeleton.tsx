import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
    return (
        <div className="p-4 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Skeleton className="h-10 w-64 mb-2" />
                    <Skeleton className="h-5 w-48" />
                </div>
                <Skeleton className="h-10 w-32 rounded-xl" />
            </div>

            {/* Financial Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="card-elevated p-6 space-y-4">
                        <div className="flex justify-between items-start">
                            <Skeleton className="h-12 w-12 rounded-2xl" />
                            <Skeleton className="h-5 w-16" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-32" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-40" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Chart */}
                <div className="lg:col-span-2 card-elevated p-8">
                    <div className="flex justify-between mb-8">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                    <Skeleton className="h-[300px] w-full" />
                </div>

                {/* Side Stats */}
                <div className="space-y-6">
                    <div className="card-elevated p-8 space-y-6">
                        <Skeleton className="h-8 w-32" />
                        <div className="grid grid-cols-2 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="p-4 bg-muted/30 rounded-2xl border border-border/50">
                                    <Skeleton className="h-5 w-5 mb-2" />
                                    <Skeleton className="h-8 w-16 mb-1" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card-elevated p-8">
                        <Skeleton className="h-8 w-32 mb-6" />
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} className="h-14 w-full rounded-xl" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
