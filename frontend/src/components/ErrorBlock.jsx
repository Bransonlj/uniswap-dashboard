export default function ErrorBlock({message}) {
    return (
        <div className="bg-red-300 rounded-xl p-4 font-semibold m-2 border-red-500 border-2">
            {message ?? "Error"}
        </div>
    )
}