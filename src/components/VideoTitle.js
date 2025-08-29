
const VideoTitle = ({ title, overview }) => {

  return (
    <div className="w-screen aspect-video px-12 pt-80 bg-gradient-to-r from-black absolute">
      <h1 className="font-bold text-8xl py-4 text-white">{title}</h1>
      <p className="w-3/6 text-sm text-white">{overview}</p>
      <div className="flex py-8">
        <button className="w-1/12  font-bold text-black bg-white text-xl rounded hover:bg-gray-400 p-4 mx-4 bg-opacity-90">▶  Play</button>
        <button className="w-1/12 font-bold bg-gray-400 bg-opacity-50 text-white rounded text-xl hover:bg-gray-400 p-4"> More Info</button>
      </div>
    </div>
  )
}

export default VideoTitle;