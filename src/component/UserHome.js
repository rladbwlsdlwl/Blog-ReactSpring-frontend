import axios from "axios"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import Error from "./Error"
export default function UserHome(){
    const {username} = useParams()

    const url = "http://localhost:8080/api/"
    const [board, setBoard] = useState([])
    const [error, setError] = useState(null)
    
    useEffect(() => {
        getBoardList()
    }, [])

    function getBoardList(){
        axios.get(url+username)
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

    console.log(username)
    if(error){
        return (
            <Error 
                status = {error.status} 
                message = {error.message}
            />
        )
    }else{
        return (
        <>
        <div>
            글 작성
        </div>
        
        <div>
            {
                board.map((data, idx) => {
                    return (
                        <div style = {{padding: "50px"}} onClick = {() => {window.location.pathname = window.location.pathname+"/"+data.id}} key = {`BOARDLIST-${idx}`}>
                            <div>{data.title}</div>
                            <div>{data.contents}</div>
                        </div>
                    )
                })
            }
        </div>
        </>
    )
    }
    
}