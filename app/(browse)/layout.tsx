import { Navbar } from "./_components/navbar";

const BrowseLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <>
    <Navbar />
    <div className="h-full flex pt-20 items-center justify-center">
      {children}
    </div>
    </>
  )
}

export default BrowseLayout;