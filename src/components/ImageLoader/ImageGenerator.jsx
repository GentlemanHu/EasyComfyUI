import React, { useState, useEffect } from 'react';
import styles from "./ImageLoaderForm.module.css";
import Image from "next/image";
import ImageLoaderForm from "@/components/ImageLoader/ImageLoaderForm"
import Loading from "/public/loading.png";

export default function ImageGenerator({data, client_id}) {
    console.log(`Start to generate image, data: ${data.img} client_id: ${client_id}`)
    const [loading, setLoading] = useState(false);
    const [srcImage, setSrcImage] = useState(data.img);

    function GetImage(client_id) {
        console.log("Start to call web socket to get image, client_id: ", client_id)
        // create webSocket
        const address = process.env.ComfyUI_BASE_ADDRESS.replace("https", "wss");
        console.log(`socket address: ${address}`);
        const socket = new WebSocket(address + '/ws?clientId=' + client_id);
        socket.addEventListener('open', (event) => {
            console.log('Connected to the server');
        });
        socket.addEventListener('error', console.error);
        socket.addEventListener('message', (event) => {
            console.log("got event from web socket, event data: ", event.data)
            const data = JSON.parse(event.data);

            if (data.type === 'progress') {
                //IS_GENERATING = true;
                console.log("Get image inprogress");
            } else if (data.type === 'executed') {
                setLoading(false);
                if ('images' in data['data']['output']) {
                    const images = data['data']['output']['images'];
                    for (let i = 0; i < images.length; i++) {
                        const filename = images[i]['filename']
                        const subfolder = images[i]['subfolder']
                        const rand = Math.random();
                        const path = `/view?filename=${filename}&type=output&subfolder=${subfolder}&rand=${rand}`;
                        console.log("image path: ", process.env.ComfyUI_BASE_ADDRESS + path);
                        setSrcImage(process.env.ComfyUI_BASE_ADDRESS + path);
                    }
                }
            } else if (data.type === 'execution_interrupted') {
                console.log('Execution Interrupted');
            } else if (data.type === 'status') {
                const IS_GENERATING = (data['data']['status']['exec_info']['queue_remaining'] > 0) ? true : false;
                console.log("is generationg? ", IS_GENERATING)
                setLoading(IS_GENERATING);
            }
        });
    }

    try{

        GetImage(client_id);
    }catch (error){
        console.log("failed to get image, error: ", error)
    }

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <div className={styles.info}>
                    <h1 className={styles.title}>{data.title}</h1>
                    <div className={styles.author}>
                        <Image
                            src={data.avatar}
                            alt=""
                            width={40}
                            height={40}
                            className={styles.avatar}
                        />
                        <span className={styles.username}>{data.username}</span>
                    </div>
                </div>
            </div>
            <div className={styles.content}>
                <p className={styles.desc}>
                    {data.desc}
                </p>
                <ImageLoaderForm data={data} client_id={client_id} />
            </div>
            <Image
                src={loading? Loading : srcImage}
                alt=""
                width={512}
                height={512}
                className={loading? styles.loading : styles.image}
            />
        </div>
    );
}