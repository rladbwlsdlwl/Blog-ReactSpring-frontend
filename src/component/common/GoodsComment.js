import { useEffect, useState } from "react"
import axios from "axios"
import { getErrorCode, getErrorMsg } from "../../utils/commonUtils"

export default function GoodsComment({likeslist, getUserInfo, token, urllikes, activeUserId, id}){
    // init
    const [likesBtn, setLikesBtn] = useState(() => getAlreadyLikes(likeslist))

    
    useEffect(() => {
        // 회원 id와 좋아요 리스트가 모두 들어왔을때 init
        if(likeslist.length && activeUserId){
            setLikesBtn(getAlreadyLikes(likeslist))
        }

    }, [likeslist, activeUserId])



    // 버튼 핸들러
    function handleLikesBtn(e){
        submitLikesBtn(!likesBtn).then((code) => {
            
            console.log(code)
        
        }).catch(err => {
            console.log(err)
            const code = getErrorCode(err)

            if(code == 401){ // UNAUTHORIZED 토큰 권한 만료!
                getUserInfo()
            }

            const msg = getErrorMsg(err)
            console.log(msg)

        })

        console.log("버튼 클릭!!")
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

    // 좋아요를 누른 회원인지 체크
    function getAlreadyLikes(data){
        // [{boardId, author}, ...]
        for(let likes of data){
            if(likes.author == activeUserId) return true
        }

        return false
    }

    // 좋아요 개수 
    function getLikesSize(likesBtn, likes_size){
        const already_likes = getAlreadyLikes(likeslist)
        if(already_likes){ // 활성회원이 이미 좋아요를 누른 경우
            return likesBtn ? likes_size: likes_size - 1
        }else{ // 활성회원이 이전에 좋아요를 누르지 않은 경우
            return likesBtn ? likes_size + 1: likes_size
        }

    }


    return (
        <div>
            {
                activeUserId != undefined ?
                    <div> 
                        <button onClick = { handleLikesBtn } disabled = {activeUserId == undefined} className = 'boardTemplateFooterBtn'>
                            { likesBtn ? <span>❤️</span>: <span>🤍</span> } 좋아요 { getLikesSize(likesBtn, likeslist.length) }
                        </button>
                        <span className = 'boardTemplateFooterBtn'>💬 댓글 3</span>
                    </div>:
                    <div> 
                    <span className = 'boardTemplateFooterBtn'>🤍 좋아요 {likeslist.length}</span>
                    <span className = 'boardTemplateFooterBtn'>💬 댓글 3</span>
                </div>
            }
        </div>
    )
}