import { getSelf } from "@/lib/auth-service"
import { getGallery, getUserGallery } from "@/lib/gallery-service"
import { Background } from "@prisma/client"
import { UploadImage } from "./upload-image"


const Gallery = async () => {

  let self = null
  try {
    self = await getSelf()
  } catch {
    console.log('You are not logged in')
  }
  
  let myGallery: Background[] = []
  
  if (self) {
    try {
      myGallery = await getUserGallery(self.id)
    } catch {
      myGallery = []
    }
  }

  console.log(myGallery)
  let gallery = []
  try {
    if (!self?.id) {
      gallery = await getGallery(null)
    
    } else {
      
      gallery = await getGallery(self.id)
      console.log(gallery)
    }
  } catch {
    return (
      <div>
        There was an error fetching your gallery, please reload the page.
      </div>
    )
  }
  console.log("hello", gallery)

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="w-full font-bold text-[36px] text-center py-4">
        Gallery
      </div>
      
      <div className="w-full grid grid-cols-4 gap-2 px-4">
        {gallery.map((background, index) => (
          <div
            key={index}
            className="w-full h-auto"
          >
            <img
              className="w-full h-full object-cover rounded-md shadow-md border-2"
              src={background.imageUrl}
            />
          </div>
        ))}
      </div>

      {myGallery 
        ? <>
          <div className="w-full font-bold text-[36px] text-center py-4">
            My Uploads
          </div>
          <div className="w-full grid grid-cols-4 gap-2 px-4">
            {myGallery.map((background, index) => (
              <div
                key={index}
                className="w-full h-auto"
              >
                <img
                  className="w-full h-full object-cover rounded-md shadow-md border-2"
                  src={background.imageUrl}
                />
              </div>
            ))}
          </div>
          </>
        : <div>

          </div>
      }
      <UploadImage />
      
    </div>
  )


}

export default Gallery