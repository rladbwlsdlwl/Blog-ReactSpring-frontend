import { Link, useParams } from "react-router-dom"
import { urlpath } from "../utils/apiUtils"
import { useContext, useEffect, useState } from "react"
import axios from "axios"
import Error from "./Error"
import { AuthContext } from "../context/AuthProvider"
import { byteToBase64 } from "../utils/commonUtils"

export default function UserBoard(){
    const {username, id} = useParams()
    const url = urlpath + `/${username}/${id}`
    const urlfile = urlpath + `/${username}/file/${id}`


    // 활성 회원 불러오기
    const { gettingUsername } = useContext(AuthContext)
    const activeUsername = gettingUsername()


    // 데이터 로드
    const [board, setBoard] = useState({})
    const [previewFile, setPreviewFile] = useState([])

    const [error, setError] = useState(null)


    useEffect(() => {

        getBoard()
        getFileList()

    }, [])


    // 이미지 파일 불러오기
    function getFileList(){
        axios.get(urlfile).then(res => {
            const data = res.data
            console.log(data)

            setPreviewFile(data)
        }).catch(err => {

            console.log(err)

        })

    }


    // 게시판 불러오기
    function getBoard(){
        axios.get(url).then(res => {
                const data = res.data 

                setBoard(res.data)
            }).catch((err) => {

                setError({
                    status: err.response.data.status, 
                    message: err.response.data.message
                })

        })
    }



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
                activeUsername == username && <div>
                    <Link to = {`/${activeUsername}/new?type=update&id=${id}`} className="link"> <span> 수정 </span> </Link>
                    <span> 삭제 </span>
                </div>
            }
            
            <div>
                {
                
                    previewFile.map(data => <>
                        <img src = {byteToBase64(data.file)} className="previewImg" alt = "이미지 없음"/>
                        </>
                    )
                }
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