import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Gradient Generator",
	description: "Generate beautiful random gradient SVGs easily.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<link rel="icon" href="/favicon.ico" type="image/svg+xml"></link>
			</head>
			<body className="antialiased min-h-screen flex flex-col">
				<main className="flex-1">
					{children}
				</main>
				<footer className="py-6 text-center text-sm text-muted-foreground border-t bg-white/50 backdrop-blur-sm dark:bg-black/50">
					<p>
						灵感来自于{" "}
						<a
							href="https://justinjay.wang/methods-for-random-gradients/"
							target="_blank"
							rel="noopener noreferrer"
							className="font-medium hover:text-primary transition-colors underline decoration-dotted underline-offset-4"
						>
							https://justinjay.wang/methods-for-random-gradients/
						</a>
					</p>
				</footer>
			</body>
		</html>
	);
}
