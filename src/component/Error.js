export default function Error({status, message}){
    return (
        <div>
            {status} {message}
        </div>
    )
}