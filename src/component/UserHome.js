import axios from "axios"
import { useEffect, useState, useContext } from "react"
import { useParams, Link } from "react-router-dom"
import Error from "./Error"
import { urlpath } from "../utils/apiUtils"

import "../css/common.css"
import "../css/UserHome.css"
import { AuthContext } from "../context/AuthProvider"

export default function UserHome(){
    const {username} = useParams()
    const url = urlpath + `/${username}`

    // 접속한 유저이름 확인
    const {gettingUsername} = useContext(AuthContext)
    const activeUsername = gettingUsername()

    // 글 불러오기
    const [board, setBoard] = useState([])
    const [boardListOrderButton, setBoardListOrderButton] = useState(1)

    // 목록열기
    const [openList, setOpenList] = useState(false)
    const [openListOrderButton, setOpenListOrderButton] = useState(1)


    // 에러 페이지
    const [error, setError] = useState(null)

    useEffect(() => {
        getBoardList()

        return () => {
            console.log("unmount!!!!!!!!!!!!!!!!!")
        }
    }, [username])


    function getBoardList(){
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



    if(error){
        return (
            <Error 
                status = {error.status} 
                message = {error.message}
            />
        )
    }

    return (
        <div className = "userHomeContainer">
            {
                activeUsername == username && 
                <div className="boardCreateBtn">
                    <Link to = {`/${username}/new?type=write`} className="link">
                        글작성
                    </Link>
                </div>
            }

            {/* 블로그 목록 */}
            <div className = "boardListMiniContainer">
                <div className = "boardListMiniTitle">
                    <div>
                        {board.length}개의 글
                    </div>
                    <div>
                        <Link onClick = {() => setOpenList(!openList)} className="link">
                            목록열기
                        </Link>
                    </div>
                </div>

                <div>
                    {
                        openList &&
                        <BoardListMini 
                            board = {board} 
                            username = {username}
                            openListOrderButton = {openListOrderButton}
                            setOpenListOrderButton = {setOpenListOrderButton}    
                        />
                    }
                </div>

            </div>
           
            <hr />
        
           {/* 메인 블로그 */}
            <div>
                <BoardListMain 
                    board = {board}
                    username = {username}
                    boardListOrderButton = {boardListOrderButton}
                    setBoardListOrderButton = {setBoardListOrderButton}
                />
            </div>
        </div>
    )
}

const BoardListMain = ({board, boardListOrderButton, setBoardListOrderButton, username}) => {
    function getBoardListMain(){
        const boardlist = []

        for(let i = 0; i < 5; i++){
            const idx = (boardListOrderButton - 1) * 5 + i

            if(idx >= board.length) break

            boardlist.push(<li className = "boardListMainTdLi" key = {`BOARDLIST-${idx}`}>
                <Link to = {`/${username}/${board[idx].id}`} className="link"><div className = "boardListMainTdImg"> </div></Link>
                <div style = {{width: "100%"}}>
                    <Link to = {`/${username}/${board[idx].id}`} className="link"><div className="boardListMainTdTitle">{board[idx].title}</div></Link>
                    <Link to = {`/${username}/${board[idx].id}`} className="link"><div className="boardListMainTdContents"> {board[idx].contents} </div></Link>
                </div>
            </li>)

            boardlist.push(<hr />)
        }

        return boardlist
    }

    function getBoardListMainButton() {
        const boardListBtn = []

        boardListBtn.push(<span className = "boardListMainBtn" onClick = {() => boardListOrderButton > 1 && setBoardListOrderButton(boardListOrderButton - 1)} key = {`boardlist-main-btn prev`}> {"<"} </span>)
        for(let i=0; i<5; i++){
            const val = Math.floor((boardListOrderButton-1)/5)*5 + i+1

            if((val-1)*5 >= board.length) break

            if(val == boardListOrderButton){
                boardListBtn.push(<strong className = "boardListMainBtn" onClick = {() => setBoardListOrderButton(val)} key = {`boardlist-main-btn${i}`}>
                    {val}
                </strong>)
            }else{
                boardListBtn.push(<span className = "boardListMainBtn" onClick = {() => setBoardListOrderButton(val)} key = {`boardlist-main-btn${i}`}>
                    {val}
                </span>)
            }
        }

        boardListBtn.push(<span className = "boardListMainBtn" onClick = {() => boardListOrderButton*5 < board.length && setBoardListOrderButton(boardListOrderButton + 1)} key = {`boardlist-main-btn next`}> {">"} </span>)

        return boardListBtn
    }
    
    
    return (
        <div>

            <table className="boardListMain">
                <thead />
                 <tbody>
                    <tr>
                        <td className="boardListMainTdL"/>
                        <td>
                            <ul className="boardListMainTdUl">
                               {
                                    getBoardListMain()
                                } 
                            </ul>
                        </td>
                        <td className="boardListMainTdR"/>
                    </tr>
                 </tbody>
            </table>

            <div className = "boardListMainBtnContainer">
                {
                    getBoardListMainButton()
                }
            </div>

        </div>
    )
}


const BoardListMini = ({board, username, openListOrderButton, setOpenListOrderButton}) =>{
    // 게시판 리스트 tbody
    function getBoardListMini(){
        const boardlist = []

        for(let i = 0; i < 5; i++){
            const idx = (openListOrderButton-1)*5+i
            
            if(idx >= board.length) break


            boardlist.push(<tr key = {`boardlist-mini ${idx}`}>
                <td className="boardListMiniTdL"><Link to = {`/${username}/${board[idx].id}`} className="link">{ board[idx].title }</Link></td>
                <td className="boardListMiniTdM"><Link to = {`/${username}/${board[idx].id}`} className="link"> 11 </Link></td>
                <td className="boardListMiniTdR"><Link to = {`/${username}/${board[idx].id}`} className="link"> 2024-07-28</Link></td>
            </tr>)
        }

        return boardlist
    }

    // 게시판 리스트 버튼 이동
    function getBoardListMiniButton(){
        const boardListBtn = []

        boardListBtn.push(<span className = "boardListMiniBtn" onClick = {() => openListOrderButton > 1 && setOpenListOrderButton(openListOrderButton - 1)} key = {`boardlist-mini-btn prev`}> {"<"} </span>)
        for(let i = 0; i < 5; i++){
            const val = Math.floor((openListOrderButton-1)/5)*5 + (i+1)
  
            if((val - 1)*5 >= board.length) break


            if(val == openListOrderButton){
                boardListBtn.push(<strong className = "boardListMiniBtn" onClick = {() => setOpenListOrderButton(val)} key = {`boardlist-mini-btn${i}`}>
                    {val}
                </strong>)
            }else{
                boardListBtn.push(<span className = "boardListMiniBtn" onClick = {() => setOpenListOrderButton(val)} key = {`boardlist-mini-btn${i}`}>
                    {val}
                </span>)
            }
        }


        boardListBtn.push(<span className = "boardListMiniBtn" onClick = {() => openListOrderButton*5 < board.length && setOpenListOrderButton(openListOrderButton + 1)} key = {`boardlist-mini-btn next`}> {">"} </span>)

        return boardListBtn
    }

    return (
        <div>

            <table className = "boardListMini">
                <thead>
                    <tr>
                        <th className = "boardListMiniTh boardListMiniThL">글제목</th>
                        <th className = "boardListMiniTh boardListMiniThM">조회수</th>
                        <th className = "boardListMiniTh boardListMiniThR">작성일</th>
                    </tr>
                </thead> 
                <tbody>
            
                {
                    getBoardListMini()
                }

                </tbody>
           </table>
            
           <div className = "boardListMiniBtnContainer">
                {getBoardListMiniButton()}
            </div>   

        </div>
    )
}