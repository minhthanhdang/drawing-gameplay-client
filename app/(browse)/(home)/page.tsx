import { getAllUsers } from "@/lib/user-service";
import { UserItem } from "../_components/user-item";

const Home = async () =>  {

  const users = await getAllUsers();

  return (
    <div className="h-full w-full flex justify-center">
      <div className=" w-[80%] max-w-[800px] border border-black">
        <div className="flex flex-col w-full py-8 text-center text-[28px] font-bold text-red-500">
          All Users
        </div>
        <div className="ps-16">
        {users.map((user) => (
          <div 
            key={user.id}>
            <UserItem 
              username={user.username}
              imageUrl={user.imageUrl}
            />
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}

export default Home