import { useParams } from "react-router-dom"

export default function UserHome(){
    const {username} = useParams()

    console.log(username)
    return (
        <>
        </>
    )
}