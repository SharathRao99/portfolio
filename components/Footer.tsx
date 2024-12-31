import Link from "next/link";

export default function Footer() {
    return (
        <section className="py-6 mt-6 border-t border-gray-200 dark:border-gray-700 shadow-sm">
            <footer key="footer" className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-2 text-center">
                <h5 className="text-lg font-bold"> Love to learn new things ❤️ </h5>
                <div className="flex gap-4 items-center">
                    <Link
                        href="mailto:sharath.byadagodu@outlook.com"
                        target="_blank"
                        className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center"
                    >
                        <MailSvg className="w-5 h-5 text-gray-800 dark:text-blue-500" />
                    </Link>
                    <Link
                        href="https://www.linkedin.com/in/sharath-b-c-45ba01203"
                        target="_blank"
                        className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center"
                    >
                        <LinkedInSvg className="w-5 h-5 text-gray-800 dark:text-blue-500" />
                    </Link>
                </div>
            </footer>
        </section>
    )
}

function MailSvg({ className }: { className: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={className}>
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
        </svg>
    );
}

function LinkedInSvg({ className }: { className: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 448 512" className={className}>
            <path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.6 0 79.5 44.3 79.5 102.6V416z" />
        </svg>
    );
}