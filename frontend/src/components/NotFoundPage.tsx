import React, { useEffect, useRef, useState } from "react";

// Main App component that renders the 404 page
function App() {
    return (
        <div className="font-inter flex min-h-screen flex-col items-center justify-center bg-background p-4 text-white">
            {/* 404 Heading */}
            <h1 className="mb-4 text-8xl font-extrabold text-admin-red drop-shadow-lg md:text-9xl">
                404
            </h1>
            {/* Page Not Found Message */}
            <p className="mb-8 text-center text-3xl font-semibold md:text-4xl">
                Oops! Page Not Found.
            </p>

            {/* The Gimmicky Lost Robot Component 
            <LostRobot />
            */}

            {/* Back to Home Button */}
            <a
                href="/"
                className="mt-12 transform rounded-full text-admin-red px-8 py-4 font-bold bg-admin-yellow shadow-lg transition duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50"
            >
                Go Back Home
            </a>
        </div>
    );
}

// LostRobot component - the gimmicky part of the 404 page
function LostRobot() {
    const [position, setPosition] = useState({ x: 50, y: 50 }); // Initial position in %
    const [message, setMessage] = useState("Searching for meaning..."); // Initial message
    const robotRef = useRef<HTMLDivElement>(null); // Ref to the robot div to get its dimensions

    // Array of quirky messages the robot can display
    const messages = [
        "Lost in the digital ether...",
        "My GPS is showing 404...",
        "Did anyone see my 'return' key?",
        "Beep boop, where am I?",
        "This URL seems... unfamiliar.",
        "Just looking for a valid path.",
        "Error: Sense of direction not found.",
        "Initiating bewildered protocol...",
        "Is this the 'about us' page?",
        "My circuits are confused.",
    ];

    // Effect for random movement
    useEffect(() => {
        const moveRobot = () => {
            if (!robotRef.current) return;

            // Get parent container dimensions (assuming it's relative to the viewport or a flex/grid item)
            // For simplicity, we'll use window dimensions here, but in a more complex layout,
            // you might get the parent's actual dimensions.
            const parentWidth = window.innerWidth;
            const parentHeight = window.innerHeight;

            // Get robot dimensions
            const robotWidth = robotRef.current.offsetWidth;
            const robotHeight = robotRef.current.offsetHeight;

            // Calculate max x and y to keep robot fully within bounds
            const maxX = parentWidth - robotWidth - 20; // 20px padding from right
            const maxY = parentHeight - robotHeight - 20; // 20px padding from bottom

            // Generate new random positions (in pixels)
            const newX = Math.random() * maxX;
            const newY = Math.random() * maxY;

            // Set position in pixels for more precise control
            setPosition({ x: newX, y: newY });
        };

        // Move robot initially and then every 5 seconds
        moveRobot(); // Initial placement
        const moveInterval = setInterval(moveRobot, 5000); // Move every 5 seconds

        // Clear interval on component unmount
        return () => clearInterval(moveInterval);
    }, []); // Empty dependency array means this runs once on mount

    // Effect for changing messages
    useEffect(() => {
        const changeMessage = () => {
            const randomIndex = Math.floor(Math.random() * messages.length);
            setMessage(messages[randomIndex]);
        };

        // Change message initially and then every 7 seconds
        changeMessage(); // Initial message
        const messageInterval = setInterval(changeMessage, 7000); // Change message every 7 seconds

        // Clear interval on component unmount
        return () => clearInterval(messageInterval);
    }, []); // Empty dependency array means this runs once on mount

    return (
        <div
            ref={robotRef}
            className="duration-3000 relative flex h-24 w-24 items-center justify-center transition-all ease-in-out" // Added transition for smooth movement
            style={{
                position: "absolute", // Position absolutely within the parent App div
                left: `${position.x}px`,
                top: `${position.y}px`,
                zIndex: 10, // Ensure robot is above other elements if needed
            }}
        >
            {/* Robot SVG Icon */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="animate-bounce-slow h-24 w-24 text-gray-300 md:h-32 md:w-32"
            >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-9h4v2h-4v-2zm0-4h4v2h-4V7zm3 10c-1.66 0-3-1.34-3-3h2c0 .55.45 1 1 1s1-.45 1-1h2c0 1.66-1.34 3-3 3z" />
            </svg>

            {/* Speech Bubble */}
            <div className="animate-fade-in-out absolute -top-10 left-1/2 whitespace-nowrap rounded-lg bg-white px-3 py-1 text-sm text-gray-800 opacity-90 shadow-md md:text-base">
                {message}
                {/* Tail for the speech bubble */}
                <div className="absolute bottom-[-5px] left-1/2 h-0 w-0 -translate-x-1/2 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
            </div>
        </div>
    );
}

// Export the main App component
export default App;
