import React from "react";
import styles from "./ImageLoaderForm.module.css";
import {GenerateImag} from "@/utils/action"

const PromptForm = ({ data, command, client_id, workflow, setWorkflow, setPromptId }) => {
    async function onSubmit(event) {
        event.preventDefault()
        const formData = new FormData(event.target)
        const prompt = formData.get("prompt");
        console.log("Get formData on submit: ", prompt);
        const jp = require("jsonpath");
        console.log("The json path is: ", command.jsonPath);
        jp.apply(workflow, command.jsonPath, function(value) { return prompt });
        setWorkflow(workflow)
        console.log("The updated workflow is:", workflow);

        const body = { 'prompt': workflow, 'client_id': client_id };
        const response = await fetch('/api/comfyui/prompt',
        {
          method: 'POST',
          body: JSON.stringify(body),
        })
        // Handle response if necessary
        const res = await response.json()
        console.log("Got response from comfyUI api: ", res)
        setPromptId(res['prompt_id'])
    }

    console.log(`received parameters in image loader form, data: ${data}, client_id: ${client_id}`);
    //const GenerateImagWithWorkflow = GenerateImag.bind(null, client_id, data.workflow);
    //const [state, formAction] = useFormState(GenerateImagWithWorkflow, data.img)

    return (
        <form onSubmit = {onSubmit} className={styles.promptForm}>
            <input
                name = "prompt"
                type = "text"
                className={styles.prompt}
                placeholder="Prompt"
            ></input>
            <button className={styles.generate}>
                Generate
            </button>
        </form>
    );
};

export default PromptForm;