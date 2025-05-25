import { useChat } from "../contexts/ChatContext"
import { Wifi, WifiOff } from "lucide-react"

const SocketStatus = () => {
  const { socketConnected, socketError } = useChat()

  return (
    <div className="fixed bottom-4 right-4 p-2 bg-white rounded-md shadow-md flex items-center">
      {socketConnected ? (
        <>
          <Wifi className="h-4 w-4 text-green-500 mr-2" />
          <span className="text-sm text-green-600">Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-red-500 mr-2" />
          <span className="text-sm text-red-600">Disconnected {socketError ? `(${socketError})` : ""}</span>
        </>
      )}
    </div>
  )
}

export default SocketStatus
