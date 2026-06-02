
export default function Hero() {
    return (
        <>
            <h1 className="absolute top-1/2 left-1/2 w-full text-center z-20 transform -translate-x-1/2 -translate-y-1/2">Flow ATS</h1>
            <div className="absolute inset-0 h-screen w-full z-10">
                <video
                    src="/AdobeStock_2009594248.mov"
                    autoPlay loop muted
                    className="absolute inset-0 w-full h-full object-cover"
                ></video>
                <div className="absolute inset-0 bg-black/40"></div>
            </div>
        </>
    )
}
