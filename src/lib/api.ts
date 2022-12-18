/* DO NOT EDIT MANUALLY, 
THIS FILE IS AVAILABLE AT https://theminibase.com/deploy-express/mod.js */

const minibase = (appName:string) => {
  let token = "";

  async function run(functionName: string, method: string, data: any = {}) {
    const baseUrl = "https://deploy-express.vercel.app/";

    const opts = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: "bearer " + token,
      },
      body: method === "GET" ? null : JSON.stringify(data),
    };

    let params = "";
    if (method === "GET") {
      params += "?";
      Object.keys(data).map((key) => {
        params += `${key}=${data[key]}&`;
      });
    }

    const res = await fetch(baseUrl + functionName + params, opts);
    const result = await res.json();

    if (result.error) {
      console.log(result.error);
      throw new Error(result.error.message);
    }

    return result.data;
  }

  return {
    setToken(value: string) {
      token = value;
    },
    getToken() {
      return token;
    },
    deploy: (data: any) => run("deploy", "POST", data),
    getProject: (data: any) => run("getProject", "GET", data),
  };
};

export default minibase("deploy-express");
