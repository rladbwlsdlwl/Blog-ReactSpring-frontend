import { useEffect, useState, useRef } from "react"
import axios from "axios"
import { getErrorCode, getErrorMsg, getDateTemplate2 } from "../../utils/commonUtils"
import "../../css/common.css"
import "../../css/GoodsComment.css"
import { Link } from "react-router-dom"


export default function GoodsComment({likeslist, commentslist, getUserInfo, token, username, urllikes, urlcomments, activeUserId, activeUsername, id}){
    // init
    const already_likes = getAlreadyLikes(likeslist, activeUserId)
    
    const [likesBtn, setLikesBtn] = useState(false) // like - dislike button
    const [commentsBtn, setCommentsBtn] = useState(false) // open - close button
    const [commentsList, setCommentsList] = useState([]) // 댓글 리스트 

    useEffect(() => {
        // 변화 감지 - 회원 id와 좋아요 리스트 변경 감지
        setLikesBtn(already_likes)

    }, [already_likes])

    useEffect(() => {
        // 변화 감지 - 회원 id와 댓글 리스트 변경 감지
        setCommentsList(commentslist)

    }, [activeUserId, commentslist])



    // 좋아요를 누른 회원인지 체크
    function getAlreadyLikes(data, activeUserId){
        // [{boardId, author}, ...]
        for(let likes of data){
            if(likes.author == activeUserId) return true
        }

        return false
    }

   
    return (
        <div>            
            <GoodsComponent
                activeUserId = {activeUserId}
                likeslist = {likeslist}
                already_likes = {already_likes}
                likesBtn = {likesBtn}
                setLikesBtn = {setLikesBtn}
                getUserInfo = {getUserInfo}
                token = {token}
                urllikes = {urllikes}
                id = {id}
            />
            <CommentsComponent
                commentsList = {commentsList}
                setCommentsList = {setCommentsList}
                activeUserId = {activeUserId}
                activeUsername = {activeUsername}
                getUserInfo = {getUserInfo}
                username = {username}
                token = {token}
                urlcomments = {urlcomments}
                id = {id}

                commentsBtn = {commentsBtn}
                setCommentsBtn = {setCommentsBtn}
                getDateTemplate2 = {getDateTemplate2}
            />
        </div>
    )
}

// 댓글 작성 || 댓글 수정 || 대댓글 작성
// Textarea 
const CommentsInput = ({ commentsList, setCommentsList, activeUserId, activeUsername, getUserInfo, token, urlcomments, id, className, parentId, contents = "", update = false, setCommentsUpdateId, commentsId, setCommentsReplyId }) => {
    const urlcommentsPOST = urlcomments + `/${id}`
    const urlcommentsPatch = urlcomments + `/${commentsId}`
    const [comments, setComments] = useState(contents)


    // textarea 
    function handleCommentsInput(e){
        const {name, value} = e.target

        setComments(value)
    }

    // submit button
    function handleCommentsButton(e){
        if(comments.length == 0){
            window.alert("댓글 내용을 입력하세요")
            return
        }

        postComments().then(code => {

            setComments("")
            console.log(`success to save data, COMMENTS: ${code}`)

        }).catch(err => {

            const code = getErrorCode(err)
            const msg = getErrorMsg(err)
            console.log(msg)

            if(code == 401){ // UNAUTHORIZED!!
                getUserInfo()
                window.alert("로그인 시간 만료! 재로그인이 필요합니다")
            }

        })
    }

    async function postComments(){
        const header = {
            "Authentication": token
        }
        const postData = {
            "author": activeUserId,
            "authorName": activeUsername,
            "boardId": id,
            "parentId": parentId,
            "contents": comments
        }
        const patchData = {
            "author": activeUserId,
            "contents": comments
        }


        if(update){
            
            const res = await axios.patch(urlcommentsPatch, patchData, {headers: header})
            const data = res.data

            const commList = []
            for(let comm of commentsList){
                if(comm.id == commentsId) commList.push({...comm, contents: data.contents, created_at: data.created_at})
                else commList.push(comm)
            }

            setCommentsList(commList)
            setCommentsUpdateId(-1)

            return res.status

        }else{

            const res = await axios.post(urlcommentsPOST, postData, {headers: header})
            const data = res.data

            setCommentsList([data, ...commentsList])
            setCommentsReplyId(-1)
            
            return res.status

        }
        
    }


    return (
        // 대댓글은 패딩 부여 commentsTemplateReplyInput
        <div className = {`commentsTemplateInputContainer ${className}`}>
            <textarea name = "comments" value = {comments} onChange = {handleCommentsInput} disabled = {activeUserId == ""} placeholder = {activeUserId == "" ? "로그인 후 입력하세요": "댓글을 입력하세요"} className = {update? "commentsTemplateInputResize": "commentsTemplateInput"} ></textarea>
            <input type = "button" onClick = {handleCommentsButton} disabled = {activeUserId == ""} className = "commentsTemplateButton" value = "작성"></input>
            {
                update && <input type = "button" onClick = {() => setCommentsUpdateId(-1)} className = "commentsTemplateButton" value = "취소"></input>
            }
        </div>
    )
}

const CommentsOption = ({ activeUsername, username, authorName, commentsId, setCommentsUpdateId, urlcomments, token, getUserInfo, commentsList, setCommentsList }) => {
    const [option, setOption] = useState(false)
    const urlcommentsDelete = urlcomments + `/${commentsId}`


    function handleCommentsBtn(e){
        const selectedOk = window.confirm("댓글을 삭제하시겠습니까?")

        if(selectedOk){
            deleteComments().then(code => {

                console.log("success to delete data -", code)

            }).catch(err => {
                
                const code = getErrorCode(err)
                const msg = getErrorMsg(err)

                if(code == 401){ // UNAUTHORIZED
                    getUserInfo()
                    window.alert("로그인 시간 만료! 재로그인이 필요합니다")
                }

                console.log(msg)

            })
        }
    }

    async function deleteComments(){
        const header = {
            "Authentication": token
        }

        const res = await axios.delete(urlcommentsDelete, {headers: header})

        setCommentsList(commentsList.filter(data => data.id != commentsId && data.parent_id != commentsId))

        return res.status
    }


    return (
        // 게시글 작성자 본인이거나 댓글 작성자일 경우 권한 부여
        // 단, 수정은 댓글 작성자만 가능
        <div className = {!(activeUsername == username || activeUsername == authorName) && "notVisible"}>
            <button onClick = {() => setOption(!option)} className = "commentsOptionButton">
                ⚙️
            </button>
            {
                option && <div> 
                    <div onClick = {() => setCommentsUpdateId(commentsId)} className = {activeUsername != authorName && "notVisible"}><Link className = "link"> 수정 </Link></div>
                    <div onClick = { handleCommentsBtn }><Link className = "link"> 삭제 </Link></div>
                </div>
            }
        </div>
    )
}

// Textarea ReadOnly
const CommentsTemplateContentsTextarea = ({contents}) => {
    const textareaRef = useRef(null)

    useEffect(() => {
        const textarea = textareaRef.current

        textarea.style.height = "auto"
        textarea.style.height = `${textarea.scrollHeight}px`

    }, [contents])

    return (
        <textarea ref = {textareaRef} className = "commentsTemplateList commentsTemplateListContents" value = {contents} readOnly/>
    )
}

// 댓글 인터페이스 아이콘 클릭 시 사용
const CommentsTemplate = ({ commentsList, setCommentsList, activeUserId, activeUsername, getUserInfo, token, username, urlcomments, id, getDateTemplate2 }) => {
    // 답글 인덱스 - CommentInput visible / hidden
    const [commentsReplyId, setCommentsReplyId] = useState(-1)
    // 댓글 수정 인덱스 - CommentInput visible / hidden
    const [commentsUpdateId, setCommentsUpdateId] = useState(-1)

    // 댓글은 하나씩만 작성 가능
    useEffect(() => {
        setCommentsUpdateId(-1)
    }, [commentsReplyId])
    useEffect(() => {
        setCommentsReplyId(-1)
    }, [commentsUpdateId])
    


    // 댓글 리스트
    // 대댓글 포함한 컴포넌트 (target이 0이면 댓글, 0이 아니면 대댓글)
    // 댓글을 수정하거나 삭제할 경우 || 대댓글을 작성할 경우 CommentsInput로 대체
    // 그 외의 경우 CommentsTemplateContentsTextarea
    function getCommentsList(target){
        const commlist = []

        for(let comm of commentsList){
            const tmp = []
            if(comm.parent_id == target){
                // 본 댓글 및 댓글 수정
                tmp.push(<div className = "commentsTemplateList"> {comm.name} </div>)
                tmp.push(<div className = "commentsTemplateList commentsTemplateListDate"> {getDateTemplate2(comm.created_at)} </div>)
                tmp.push(<CommentsTemplateContentsTextarea contents = {comm.contents} />)
                commlist.push(commentsUpdateId != comm.id ?
                <li className = {target != 0 ? "commentsTemplateListContainer commentsTemplateListChild": "commentsTemplateListContainer"}>
                    <div>
                       {tmp} 
                    </div>
                    <div>
                        <CommentsOption 
                            activeUsername = {activeUsername}
                            username = {username}
                            authorName = {comm.name}
                            commentsId = {comm.id}
                            setCommentsUpdateId = {setCommentsUpdateId}
                            
                            urlcomments = {urlcomments}
                            token = {token}
                            getUserInfo = {getUserInfo}
                            commentsList = {commentsList}
                            setCommentsList = {setCommentsList}
                        />
                    </div>
                </li>: <CommentsInput 
                    commentsList = {commentsList}
                    setCommentsList = {setCommentsList}
                    activeUserId = {activeUserId}
                    activeUsername = {activeUsername}
                    getUserInfo = {getUserInfo}
                    token = {token}
                    urlcomments = {urlcomments}
                    id = {id}
                    className = {target != 0 && "commentsTemplateListReplyInput"}
                    parentId = {target != 0? target: comm.id}

                    contents = {comm.contents}
                    update = {true}
                    setCommentsUpdateId = {setCommentsUpdateId}
                    commentsId = {comm.id}
                />)


                // 답글 컴포넌트
                commlist.push(<button onClick = {() => setCommentsReplyId(commentsReplyId == comm["id"]? -1: comm["id"])} className = {target != 0 ? "commentsTemplateListChild commentsTemplateListReplyBtn": "commentsTemplateListReplyBtn"}>답글</button>) 
                commlist.push(comm.id == commentsReplyId && <CommentsInput  
                    commentsList = {commentsList}
                    setCommentsList = {setCommentsList}
                    activeUserId = {activeUserId}
                    activeUsername = {activeUsername} 
                    getUserInfo = {getUserInfo} 
                    token = {token} 
                    urlcomments = {urlcomments}
                    id = {id}
                    className = {target != 0 && "commentsTemplateListReplyInput"}
                    parentId = {target != 0? target :comm.id}

                    setCommentsReplyId = {setCommentsReplyId}
                />)

                commlist.push(<hr />)


                // 대댓글 추가
                commlist.push(getCommentsList(comm.id))
            }

        }

        return commlist
    }


    return (
        <div>
            <div className = "commentsTemplateContainer">
                {/* 댓글 입력창 */}
                <CommentsInput
                    commentsList = {commentsList}
                    setCommentsList = {setCommentsList}
                    activeUserId = {activeUserId}
                    activeUsername = {activeUsername} 
                    getUserInfo = {getUserInfo} 
                    token = {token} 
                    urlcomments = {urlcomments}
                    id = {id}    
                    parentId = {0}

                    setCommentsReplyId = {setCommentsReplyId}
                />

                {/* 댓글 목록 */}
                <ul className = "commentsTemplateUListContainer">
                    { 
                        getCommentsList(0)
                    }
                </ul>
            </div>

        </div>
    )
}


const CommentsComponent = ({ commentsList, setCommentsList, activeUserId, activeUsername, getUserInfo, token, username, urlcomments, id, commentsBtn, setCommentsBtn, getDateTemplate2 }) => {
    return (
        <span>
            <button className = 'commentsComponentButton' onClick = { () => setCommentsBtn(prev => !prev)}>💬 댓글 { commentsList.length }</button>
            { 
                commentsBtn && <CommentsTemplate
                    commentsList = {commentsList}
                    setCommentsList = {setCommentsList}
                    activeUserId = {activeUserId}
                    activeUsername = {activeUsername}
                    getUserInfo = {getUserInfo} 
                    token = {token} 
                    username = {username}
                    urlcomments = {urlcomments}
                    id = {id}
                    getDateTemplate2 = {getDateTemplate2}
                />
            }
        </span>
    )
}
const GoodsComponent = ({ activeUserId, likeslist, already_likes, likesBtn, setLikesBtn, getUserInfo, token, urllikes, id }) => {

    // 버튼 핸들러
    function handleLikesBtn(e){
        submitLikesBtn(!likesBtn).then((code) => {
            
            console.log(code)
        
        }).catch(err => {

            const code = getErrorCode(err)
            const msg = getErrorMsg(err)

            if(code == 401){ // UNAUTHORIZED 토큰 권한 만료!
                getUserInfo()
                window.alert("로그인 시간 만료! 재로그인이 필요합니다")
            }

            console.log(msg)

        })

        setLikesBtn(!likesBtn)
    }

    async function submitLikesBtn(isPostLike){
        const header = {
            "Authentication": token
        }
        const query = {
            userId: activeUserId
        }

        const postData = {
            boardId: id,
            author: activeUserId
        }

        if(isPostLike){

            const res = await axios.post(urllikes, postData, {headers: header})

            const data = res.data
            
            return res.status

        }else{

            const res = await axios.delete(urllikes, {headers: header, params: query})
            
            return res.status

        }
    }


    // 좋아요 개수 
    function getLikesSize(likesBtn, likes_size){
        if(already_likes) // 활성회원이 이미 좋아요를 누른 경우
            return likesBtn ? likes_size: likes_size - 1
        else // 활성회원이 이전에 좋아요를 누르지 않은 경우
            return likesBtn ? likes_size + 1: likes_size
    }


    return (
        <button onClick = { handleLikesBtn } disabled = {activeUserId == ""} className = 'goodsComponentButton'>
                { likesBtn ? <span>❤️</span>: <span>🤍</span> } 좋아요 { getLikesSize(likesBtn, likeslist.length) }
        </button>
    )
}