import { useContext, useEffect } from "react"
import { AuthContext } from "../context/AuthProvider"

export default function UserBoardCreate(){
    const {gettingToken, settingToken} = useContext(AuthContext)
    
    useEffect(() => {

    }, [])
    return (
        <div>

        </div>
    )
}