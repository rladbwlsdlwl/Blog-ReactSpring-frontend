import { useContext, useEffect, useRef, useState } from "react"
import { AuthContext } from "../context/AuthProvider"
import { urlpath } from "../utils/apiUtils"
import Error from "./Error"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import axios from "axios"
import BoardList from "./common/BoardList"
import FileList from "./common/FileList"

import "../css/UserBoardCreateUpdate.css"
import { getErrorCode, getErrorMsg, getFileUrl } from "../utils/commonUtils"
import { type } from "@testing-library/user-event/dist/type"

export default function UserBoardCreateUpdate(){
    const { username } = useParams()
    const [URLSearchParams, SetURLSearchParams] = useSearchParams()
    const [type, id] = [URLSearchParams.get("type"), URLSearchParams.get("id")]
    
    const urlwrite = urlpath + `/${username}`
    const urlupdate = urlpath + `/${username}/${id}`
    const urlfilewrite = urlpath + `/${username}/file`
    const urlfile = urlpath + `/${username}/file/${id}`
    const urltags = urlpath + `/tags/${id}`

    
    // 접속 유저 이름찾기
    // 토큰 불러오기
    const { gettingToken, settingToken, gettingUsername, gettingUserId } = useContext(AuthContext)
    const [ activeUsername, token, author ] = [gettingUsername(), gettingToken(), gettingUserId()]


    // 인풋 데이터
    const [board, setBoard] = useState({})
    const [file, setFile] = useState([]) // 새로운 파일만 등록 <File>
    const [previewFile, setPreviewFile] = useState([]) // 모든 파일 미리보기 url
    const [beforeFilenameList, setBeforeFilenameList] = useState([]) // 기존 파일만 등록 <Json Obj>
    const [hashtag, setHashtag] = useState([])


    // 에러 페이지
    const [error, setError] = useState(null)
    // 모달창 활성화
    const [isModalOpen, setIsModalOpen] = useState(false)



    useEffect(() => {
        
        if(type == "write"){
            return 
        }else if(type == "update"){
            
            Promise.all([
                getBoardList(),
                getFileList(),
                getHashtagList()
            ]).catch(err => {
                const code = getErrorCode(err)
                const msg = getErrorMsg(err)

                console.log(msg)
                setError(true)
            }) 

        }else{
            setError(true)
        }


        return () => {
            // Blob URL 메모리 해제
            previewFile.map(prevFile => {
                // URL이 아닌 새로운 파일 미리보기는 메모리 해제
                if(prevFile.currentFilename == "") 
                    URL.revokeObjectURL(prevFile.file)
            })
        }
    }, [])


    // 게시판 불러오기
    async function getBoardList(){
        const res = await axios.get(urlupdate)

        const data = res.data

        setBoard(data)
    }

     // 파일 불러오기
     async function getFileList(){
        const res = await axios.get(urlfile)

        const data = res.data

   
        setPreviewFile(data) // currentFilename =  "" 이면 신규 파일, 그렇지 않으면 기존 파일
    }

    async function getHashtagList(){
        const res = await axios.get(urltags)
        const data = res.data.data // List<String>

        setHashtag(data.map(d => d.tagname)) // tagname만 추출하여 저장
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
                beforeFilenameList = {beforeFilenameList}
                hashtag = {hashtag}
                setHashtag = {setHashtag}
                isModalOpen = {isModalOpen}
                setIsModalOpen = {setIsModalOpen}

                isUpdatePost = {type == "update"}
                urlwrite = {urlwrite}
                urlupdate = {urlupdate}
                urlfilewrite = {urlfilewrite}
                token = {token}  
                username = {username}
                author = {author}

                settingToken = {settingToken}
                getErrorCode = {getErrorCode}
                getErrorMsg = {getErrorMsg}
            />

            <FileList
                file = {file} // 새로운 파일 
                previewFile = {previewFile} // 모든 파일 
                beforeFilenameList = {beforeFilenameList} // 기존 파일
                setFile = {setFile}
                setPreviewFile = {setPreviewFile}
                setBeforeFilenameList = {setBeforeFilenameList}
            />
            
            <BoardList 
                board = {board}
                setBoard = {setBoard}
            />
        </div>
    )
}


// 게시판 전송 및 파일 조작(File to Base64, Binary data) 컨테이너
const Toolbar = ({board, file, setFile, previewFile, setPreviewFile, beforeFilenameList, urlwrite, urlupdate, urlfilewrite, isUpdatePost, token, username, author, settingToken, getErrorCode, getErrorMsg, isModalOpen, setIsModalOpen, hashtag, setHashtag}) => {

    const navigate = useNavigate()
    const [tmpHashtag, setTmpHashtag] = useState("")
    const [hashtagError, setHashtagError] = useState("")


    // setting - 파일 이미지 (File)
    function handlerImage(e){
        const files = Array.from(e.target.files)
        // console.log(files)
        

        // 파일 검증 로직
        // jpeg, png, jpg...
        const isValidateFilesType = (files) =>{
            for(let f of files){
                if(!["image/png", "image/jpg", "image/jpeg", "image/heif"].includes(f.type)){
                    return false
                }
            }

            // console.log("type passed!")
            return true
        }

        // 단독 파일은 5MB 이하, 파일 총 50MB를 넘지 않아야 함
        const isValidateFileSize = (files) =>{
            let pSum = 0
            for(let f of files){
                pSum += f.size

                if(f.size > 5000_000){
                    return false
                }
            }

            if(pSum > 50_000_000){
                return false
            }

            
            // console.log("size passed!", pSum)
            return true
        }
        

        if(!isValidateFilesType(files) || !isValidateFileSize(files)){
            window.alert("파일의 타입이 맞지 않거나 용량 초과입니다")

            return 
        }


        // File to Base64
        // 파일을 이진데이터 텍스트로 변환 - FileReader의 readAsDataURL
        // updatePreviewImage(files)
        

        // Blob(File) 타입으로 변환 - URL.createObjectURL
        setPreviewFile([...previewFile, ...files.map(file => {
            return {
                file: getFileUrl(file),
                originalFilename: file.name,
                currentFilename: ""
            }
        })])
        setFile([...file, ...files])
    }


    // setting - 파일 미리보기 이미지 
    // function updatePreviewImage(files){
        
    //     files.forEach(f => {
    //         const reader = new FileReader()
    //         reader.onload = (e) => {
    //             const imglink = e.target.result
    //             // console.log(imglink)
    //             setPreviewFile((prev) => [...prev, imglink])
    //         }


    //         reader.readAsDataURL(f)
    //     })

    // }


    // 해시태그 핸들러
    function handleHashtagInput(e){
        const value = e.target.value
        
        setHashtagError("")
        setTmpHashtag(value.trim())
    }

    // 해시태그 엔터 감지 핸들러
    function handleHashtagInputEnter(e){

        if(e.key == "Enter"){
            if(tmpHashtag == "")
                return 
            if(hashtag.includes(tmpHashtag)){
                setHashtagError("이미 존재하는 해시태그입니다")
                return
            }

            setHashtag([...hashtag, tmpHashtag])
            setTmpHashtag("")
        }

    }

    // 해시태그 클릭 핸들러
    function handleHashtag(e){
        const value = e.target.getAttribute("value")

        setHashtag(hashtag.filter(tag => tag != value))
    }

    // 게시글 작성 핸들러
    function handleSubmitPost(){
        
        postBoard().then((res) => {
            const boardId = res
            
            navigate(`/${username}/${boardId}`)


        }).catch(err => {

            console.log(err)
            
            const code = getErrorCode(err)
            const msg = getErrorMsg(err)

            if(code == 401) // 토큰 만료 - JWT EXPIRED
                settingToken("")
            else
                console.log("로직에 문제가 있는 상황입니다... 트랜젝션이 이루어지지 않음")
                

            
            alert(`게시판 작성 에러 - ${msg}`)
        })
    }

    // 게시글 작성
    async function postBoard(){
        // http header
        const header = {
            "Authentication": token
        }

        const postData = {
            ...board
        }

        // http body
        const formData = new FormData()

        // file
        file.forEach(f => formData.append("file", f))
        
        // board
        formData.append("board", new Blob([JSON.stringify(postData)], {type: "application/json"}))

        // hashtag
        const tag = {"name": hashtag}
        formData.append("hashtag", new Blob([JSON.stringify(tag)], {type: "application/json"}))



        if(isUpdatePost){
            // patch
            beforeFilenameList.forEach(dfilename => formData.append("removeFilenameList", new Blob([dfilename], {type: "application/json"})) )

            const res = await axios.patch(urlupdate, formData, {headers: header})
            const data = res.data
            
            return data.id
        }else{
            // post

            const res = await axios.post(urlwrite, formData, {headers: header})
            const data = res.data

            return data.id
        }

    }


    return (
        <div className="toolbarContainer">
            <label className="toolbarLabel">
                파일
                <input type = "file" accept = "image/*" multiple onChange = {handlerImage} className="toolbarLabelInput"></input>
            </label>

            <button onClick = {() => setIsModalOpen(true)} className="toolbarPostBtn">
                작성
            </button>
            {isModalOpen && (
                <div className="toolbarModalContainer">
                    <div className="toolbarModalContent"> 
                        <button onClick = {() => setIsModalOpen(false)} className="toolbarModalCloseButton">X</button>
                        {
                            hashtag.map(tag => <span value = {tag} onClick = {handleHashtag} className="toolbarModalHashtag"> {tag} </span>)
                        }
                        <input type = "text" placeholder="해시태그 입력 (엔터로 구분)" value = {tmpHashtag} onChange = {handleHashtagInput} onKeyDown = {handleHashtagInputEnter} className="toolbarModalInput"></input>
                        <span>{hashtagError}</span>
                        <button onClick = {handleSubmitPost} className="toolbarModalButton">작성</button>
                    </div>
                </div>
            )}
        </div>
    )
}
