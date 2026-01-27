import { Skeleton } from "./ui/skeleton";

export function ProductSkeleton() {
    return (
        <div className="card-product overflow-hidden bg-card border border-border/30 rounded-2xl">
            <Skeleton className="aspect-square w-full" />
            <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-7 w-24" />
                    <Skeleton className="h-10 w-20 rounded-xl" />
                </div>
            </div>
        </div>
    );
}

export function ProductGridSkeleton() {
    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
                <ProductSkeleton key={i} />
            ))}
        </div>
    );
}
