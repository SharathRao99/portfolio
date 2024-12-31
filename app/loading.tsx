export default function Loading() {
    return (
        <div className="flex h-[calc(100vh-250px)] md:h-[calc(100vh-200px)] w-full items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-black dark:border-gray-600 dark:border-t-white"></div>
        </div>
    );
}
