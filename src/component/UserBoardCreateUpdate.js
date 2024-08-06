import { useContext, useEffect, useRef, useState } from "react"
import { AuthContext } from "../context/AuthProvider"
import { urlpath } from "../utils/apiUtils"
import Error from "./Error"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import axios from "axios"

import "../css/UserBoardCreateUpdate.css"

export default function UserBoardCreateUpdate(){
    const {username} = useParams()
    const [URLSearchParams, SetURLSearchParams] = useSearchParams()
    const [type, id] = [URLSearchParams.get("type"), URLSearchParams.get("id")]
    
    const urlwrite = urlpath + `/${username}`
    const urlupdate = urlpath + `/${username}/${id}`

    // 접속 유저 이름찾기
    // 토큰 불러오기
    const {gettingToken, settingToken, gettingUsername, gettingUserId} = useContext(AuthContext)
    const [activeUsername, token, author] = [gettingUsername(), gettingToken(), gettingUserId()]


    // 인풋 데이터
    const [board, setBoard] = useState({})
    const [file, setFile] = useState([])
    const [previewFile, setPreviewFile] = useState([])


    // 에러 페이지
    const [error, setError] = useState(null)


    useEffect(() => {
        console.log(type, id)
        if(type == "write"){
            return 
        }else if(type == "update"){
            getBoardList() 
            
            // getFile 로직



        }else{
            setError(true)
        }
    }, [])

    useEffect(() => {
        console.log(board)
    }, [board])

    function getBoardList(){
        axios.get(urlupdate).then(res => {
            const data = res.data

            setBoard(data)

        }).catch(err=>{
            console.log(err)
            setError(true)
        })
    }


    // console.log(username, activeUsername)
    if(username != activeUsername || error){
        return (
            <Error 
                status = "400"
                message = "잘못된 접근입니다"
            />
        )
    }

    return (
        <div className = "userBoardCreateUpdateContainer">
            <Toolbar
                board = {board}
                file = {file}
                setFile = {setFile}
                previewFile = {previewFile}
                setPreviewFile = {setPreviewFile}

                isUpdatePost = {type == "update"}
                urlwrite = {urlwrite}
                urlupdate = {urlupdate}
                token = {token}  
                username = {username}
                author = {author}
            />

            <FileList
                file = {file}
                previewFile = {previewFile}
                setFile = {setFile}
                setPreviewFile = {setPreviewFile}
            />
            
            <BoardList 
                board = {board}
                setBoard = {setBoard}
                previewFile = {previewFile}
            />
        </div>
    )
}

const Toolbar = ({board, file, setFile, previewFile, setPreviewFile, urlwrite, urlupdate, isUpdatePost, token, username, author}) => {

    const navigate = useNavigate()

    // setting - 파일 이미지 (File)
    function handlerImage(e){
        const files = Array.from(e.target.files)
        console.log(files)


        updatePreviewImage(files)
        
        setFile([...file, ...files])
    }


    // setting - 파일 미리보기 이미지 (FileReader)
    function updatePreviewImage(files){
        
        files.forEach(f => {
            const reader = new FileReader()
            reader.onload = (e) => {
                const imglink = e.target.result
                setPreviewFile((prev) => [...prev, imglink])
            }


            reader.readAsDataURL(f)
        })

    }

    // 게시글 작성 핸들러
    function handleSubmitPost(){
        const header = {
            "Authentication": token
        }

        const data = {
            ...board, 
            author: author
        }
        
        
        if(isUpdatePost){
            // patch

            axios.patch(urlupdate, data, {headers: header}).then(res => {
                const data = res.data
                console.log(data)

                window.alert("작성 완료")

                navigate(`/${username}/${data.id}`)
            }).catch(err => {
                console.log(err)

            })
        
        }
        else{
            // post
            
            axios.post(urlwrite, data, {headers: header}).then(res => {
                const data = res.data
                console.log(data)

                window.alert("작성 완료")

                navigate(`/${username}/${data.id}`)
            }).catch(err => {
                console.log(err)

            })
        }
    }

    return (
        <div className="toolbarContainer">
            <label className="labelImage">
                파일
                <input type = "file" accept = "image/*" multiple onChange = {handlerImage} className="inputImage"></input>
            </label>

            <button onClick = {handleSubmitPost} className="postButton">
                저장
            </button>
        </div>
    )
}

const FileList = ({file, previewFile, setFile, setPreviewFile}) =>{

    useEffect(() => {
        console.log(previewFile)
    }, [previewFile])


    function handleDeleteFile(index){
        setFile(file.filter((data, idx) => idx != index))
        setPreviewFile(previewFile.filter((data, idx) => idx != index))
    }


    return (
        <div className="fileListContainer">
            {
                previewFile.map((prevFile, index) =><div className="previewImgContainer"> 
                    <img src = {prevFile} className="previewImg" key = {`preview file - ${index}`}/>
                    <div className= "previewFilename" key = {`preview file name - ${index}`}><span>{file[index].name}</span> <button className = "deleteButton" onClick = {() => handleDeleteFile(index)}> X </button> </div>
                </div>)
            }
        
        </div>
    )
}

const BoardList = ({board, setBoard}) =>{

    function handleTextarea(e){
        console.log(e)
        const {name, value} = e.target

        setBoard({
            ...board,
            [name]: value
        })
    }

    return (
        <div>
            <textarea name = "title" onChange = { handleTextarea } maxLength={15} className="title">
                
            </textarea>

            <hr />

            <textarea name = "contents" onChange = { handleTextarea } maxLength={999998} className="contents">
                
            </textarea>
        </div>
    )
}