import { pageContent } from "@/constants/pageContent";

export function Footer() {
    return (
        <footer className="mt-12 border-t border-gray-800 bg-gray-900/60 text-center py-6 text-gray-300">
            <p>{pageContent.footer.poweredBy}</p>
            <p className="mt-1 text-gray-400">{pageContent.footer.copyright}</p>
        </footer>
    );
}
