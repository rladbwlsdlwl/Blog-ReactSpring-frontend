import { useParams } from "react-router-dom"
import { urlpath } from "../utils/apiUtils"
import { useContext, useEffect, useState } from "react"
import axios from "axios"
import Error from "./Error"
import { AuthContext } from "../context/AuthProvider"

export default function UserBoard(){
    const {gettingToken, settingToken} = useContext(AuthContext)

    const {username, id} = useParams()
    const url = urlpath + `/${username}/${id}`

    const [board, setBoard] = useState({})
    const [error, setError] = useState(null)


    useEffect(() => {
        getData()
    }, [])
    function getData(){
        axios.get(url)
            .then((res) => {
                console.log("SUCCESS TO READ USER BOARD")
                setBoard(res.data)
            }).catch((err) => {
                console.log(`FALIED TO READ USER BOARD - ${err.response.status}`)
                setError({
                    status: err.response.data.status, 
                    message: err.response.data.message
                })
        })
    }

    console.log(url)
    if(error){
        return (
            <Error 
                status = {error.status} 
                message = {error.message}
            />
        )
    }else{
        return (
        <div>
            {

            }
            <div>
                수정
            </div>
            <div> 
                삭제
            </div>
            <div>
                {board.title}
            </div>
            <div>
                {board.contents}
            </div>
        </div>
    )}
}