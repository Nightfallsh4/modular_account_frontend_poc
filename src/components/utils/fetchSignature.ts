
export async function fetchSignature() {
    const data = await fetch("/api/getSignature")
    console.log(await data.json())
    
}