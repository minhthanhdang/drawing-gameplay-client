import { Background } from "@prisma/client"


interface BackgroundChoiceProps {
  backgrounds: Background[],
  setBackground: (background: Background) => void
}

export const BackgroundChoice = ({
  backgrounds,
  setBackground
}: BackgroundChoiceProps) => {

  console.log(backgrounds)

  return (
    <div className="w-full h-full">
      <div className="grid grid-cols-4 gap-2 p-2">
        {backgrounds.map((background, index) => (
          <div
            key={index}
            className="w-full h-auto"
          >
            <img
              className="w-full h-full object-cover rounded-md shadow-md"
              src={background.imageUrl}
              onClick={() => setBackground(background)}
            />
          </div>
        ))

        }
      </div>
    </div>
  )
}