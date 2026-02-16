const BASE_URL = "http://localhost:3000";

export async function apiRequest(endpoint, method="GET", body=null){

    const token = localStorage.getItem("token");

    const options = {
        method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": token
        }
    };

    if(body) options.body = JSON.stringify(body);

    const response = await fetch(BASE_URL + endpoint, options);

    const data = await response.json();

    if(!response.ok){
        throw new Error(data.message || "Something went wrong");
    }

    return data;
}
