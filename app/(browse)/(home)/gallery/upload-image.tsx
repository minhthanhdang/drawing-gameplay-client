"use client"

import React, { useState, ChangeEvent } from "react"
import S3 from 'react-aws-s3-typescript'

export const UploadImage = () => {
  const [image, setImage] = useState<File|null>(null)

  const handleImage = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target?.files) return
    setImage(e.target.files[0])
  }

  const handleUpload = () => {
    const ReactS3Client = new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET!,
      bucketName: process.env.BUCKET_NAME!,
      region: process.env.REGION!,
      dirName: 'media',
      s3Url: 'https://drawing-gameplay.s3.amazonaws.com',
    })
    ReactS3Client.uploadFile(image!)
      .then((data) => console.log(data))
      .catch((err) => console.error(err))
  }


  return (
    <div>
      {image && 
        <img 
          src={URL.createObjectURL(image)} 
          className="object-cover w-[200px] h-[354px] overflow-hidden"
        /> 
      }
      <input type="file" onChange={handleImage} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  )
}

