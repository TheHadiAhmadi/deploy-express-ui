async function upload_file(file_name, code, vercel_token) {
  const sha = crypto.createHash("sha1").update(code).digest("hex");

  await fetch("https://api.vercel.com/v2/files", {
    method: "POST",
    headers: {
      "x-vercel-digest": sha,
      Authorization: `Bearer ${vercel_token}`,
      "Content-Type": "text/plain",
    },
    body: code,
  });

  return {
    file: file_name,
    sha,
    size: code.length,
  };
}

async function create_deployment({
  name,
  vercel_token,
  url,
  index_js,
  package_json,
  env,
}) {
  // upload files
  const files = await Promise.all([
    upload_file("index.js", index_js, vercel_token),
    upload_file("package.json", package_json, vercel_token),
  ]);

  const body = {
    name,
    alias: url,
    files,
    env,
    builds: [
      {
        use: "@vercel/node",
        src: "index.js",
      },
    ],
    rewrites: [{ source: "/(.*)", destination: "/" }],
    headers: [
      {
        source: "/(.*)",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ],
    projectSettings: {
      framework: null,
    },
    target: "production",
  };

  // create deployment
  const result = await fetch("https://api.vercel.com/v13/deployments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${vercel_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }).then((res) => res.json());

  // save to database
  return result;
}

handle = async (body, ctx) => {
  let { id, url, index_js, packages, password, vercel_token, name } = body;

  if (!index_js) {
    return {
      body,
      error: {
        message: "no index_js provided",
      },
    };
  }

  let dependencies = {};
  if (packages) {
    for (let pack of (packages ?? "").split(",")) {
      dependencies[pack] = "*";
    }
  }

  let package_json = JSON.stringify({ name, dependencies });

  if (!name) name = `deploy-express-${crypto.randomUUID()}`; // nanoid;
  if (!url) url = `deploy-express-project-${name}.vercel.app`;

  if (!vercel_token) vercel_token = ctx.env.VERCEL_TOKEN;

  if (!passowrd) {
    return {
      error: {
        message: "project doesnt have password",
      },
    };
  }

  const project = await ctx.db.prject.get(id);
  if (project.password !== password) {
    return {
      error: {
        message: "project password is invalid",
      },
    };
  }

  const result = await create_deployment({
    name,
    vercel_token,
    url,
    index_js,
    package_json,
    env: ctx.env,
  });

  if (id) {
    await ctx.db.project.update(id, {
      name,
      url,
      password,
      index_js,
      packages,
    });
  } else {
    id = await ctx.db.project.insert({
      name,
      url,
      password,
      index_js,
      packages,
    });
  }

  return {
    data: {
      id,
      result,
    },
  };
};
