<script lang="ts">
  import api from "$lib/api";
  import {
    Modal,
    Card,
    CardHeader,
    CardFooter,
    CardTitle,
    FormGroup,
    Label,
    Row,
    Col,
    ButtonList,
    Input,
    CardBody,
  } from "@svind/svelte";

  import { page } from "$app/stores";
  import { onMount } from "svelte";

  let resultModalOpen = false;
  let request: any = {};
  let result = "";

  let deployModalOpen = false;

  function openDeploy() {
    deployModalOpen = true;
  }

  async function deploy() {
    console.log(request);

    if (!request.password || !request.code) return;

    result = await api.deploy({
      id: request.id,
      url: request.url,
      password: request.password,
      index_js: request.code,
      packages: request.packages,
    });

    deployModalOpen = false;

    resultModalOpen = true;
  }

  onMount(async () => {
    const id = $page.url.searchParams.get("id");
    const password = $page.url.searchParams.get("password");

    if (id && password) {
      // get project

      console.log("mount, id, passowrd");
      try {
        const project = await api.getProject({ id, password });

        request = {
          id: id,
          code: project.index_js,
          packages: project.packages,
          url: project.url,
          password: project.password,
        };
      } catch (err) {
        //
      }
    }
  });
</script>

<Row class="h-full">
  <Col class="h-full" col="12" sm="6" md="4" lg="3">
    <Row class="p-4">
      <Col col="12">
        <FormGroup>
          <Label for="input-id">id</Label>
          <Input disabled id="input-id" bind:value={request.id} />
        </FormGroup>
      </Col>
      <Col col="12">
        <FormGroup>
          <Label for="input-password">Password</Label>
          <Input
            id="input-password"
            placeholder="type a password for this project"
            bind:value={request.password}
          />
        </FormGroup>
      </Col>
      <Col col="12">
        <FormGroup>
          <Label for="input-url">URL</Label>
          <Input id="input-url" bind:value={request.url} />
        </FormGroup>
      </Col>

      <Col col="12">
        <FormGroup>
          <Label for="input-packages">NPM Packages (comma separated)</Label>
          <Input
            id="input-packages"
            placeholder="express,knex,cors,..."
            bind:value={request.packages}
          />
        </FormGroup>
      </Col>

      <Col class="pt-4" col="12">
        <button on:click={openDeploy} class="btn btn-primary btn-block">
          Deploy
        </button>
      </Col>
    </Row>
  </Col>

  <Col class="h-full" col="12" sm="6" md="8" lg="9">
    <Card class="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Paste content of index.js</CardTitle>
      </CardHeader>
      <CardBody class="h-full">
        <textarea
          class="form-control h-full font-mono p-2 resize-none"
          spellcheck="false"
          bind:value={request.code}
        />
      </CardBody>
    </Card>
  </Col>
</Row>

<Modal bind:open={deployModalOpen}>
  <Card>
    <CardBody>
      <div class="border border-gray-200 text-gray-700 bg-gray-50 p-4">
        If you provide your vercel token, project will be deployed in your
        vercel account. <br />
        otherwise project will be deployed from my account.
        <br />
        <br />
        You can create a token from
        <a
          class="font-bold text-blue-400 hover:underline"
          href="https://vercel.com/account/tokens">Here</a
        >
      </div>
      <FormGroup>
        <Label for="vercel-token">Vercel Token</Label>
        <Input id="vercel-token" bind:value={request.vercel_token} />
      </FormGroup>
    </CardBody>
    <CardFooter>
      <ButtonList>
        <button on:click={() => (deployModalOpen = false)} class="btn">
          Cancel
        </button>
        <button on:click={deploy} class="btn btn-primary">Deploy</button>
      </ButtonList>
    </CardFooter>
  </Card>
</Modal>

<Modal bind:open={resultModalOpen}>
  <Card class="max-w-2xl">
    <CardBody class="max-h-70vh overflow-auto">
      <pre>
        {JSON.stringify(result, null, 2)}
      </pre>
    </CardBody>
  </Card>
</Modal>
