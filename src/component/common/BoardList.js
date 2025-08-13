import { useEffect, useState, useRef } from "react"
import "../../css/common.css"
import "../../css/BoardList.css"

// 게시판 컨테이너
export default function BoardList({board, setBoard, disabled = false}){
    const textareaRef = useRef(null)
    
    // 가변 길이 Textarea
    useEffect(() => {
        const textarea = textareaRef.current

        textarea.style.height = "auto"
        textarea.style.height = `${textarea.scrollHeight}px`

    }, [board.contents])

    // board 값 수정
    function handleTextarea(e){
        const {name, value} = e.target

        setBoard({
            ...board,
            [name]: value
        })
    }

    function handlePreventEnter(e){
        if(e.key == "Enter")
            e.preventDefault()
    }

    return (
        <div>
            <textarea name = "title" value = {board.title} onChange = { handleTextarea } onKeyDown = { handlePreventEnter } maxLength={15} className="boardListTitle" disabled = {disabled}>
                
            </textarea>

            <hr className = "boardListLine"/>

            <textarea ref={textareaRef} name = "contents" value = {board.contents} onChange = { handleTextarea } maxLength={999998} className="boardListContents" disabled = {disabled}>
                
            </textarea>
        </div>
    )
}