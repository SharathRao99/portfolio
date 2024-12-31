export default function Card({ children }: { children: React.ReactNode }) {
    return <div className="w-full h-full p-4 md:p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
        {children}
    </div>
}