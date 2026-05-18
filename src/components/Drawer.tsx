import { AnimatePresence, motion } from "framer-motion";
import { avatars } from "../constants/avatars.tsx";

const Drawer = ({
  open,
  setOpen,
  setURL,
  setCurrentPos,
  selectedAvatar,
  setSelectedAvatar,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setURL: React.Dispatch<React.SetStateAction<string>>;
  setCurrentPos: React.Dispatch<React.SetStateAction<number>>;
  selectedAvatar: string;
  setSelectedAvatar: React.Dispatch<React.SetStateAction<string>>;
}) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Background Blur Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />

          {/* Drawer Panel */}
          <motion.div
            className="fixed top-0 right-0 z-50 h-full w-69 sm:w-80 md:w-78 bg-[#1a1a1a] text-white shadow-xl p-5"
            initial={{ x: 350 }}
            animate={{ x: 0 }}
            exit={{ x: 350 }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 20,
            }}
          >
            <h2 className="text-2xl font-semibold avatar text-[#FAFAF9] ">
              Select Your Avatar
            </h2>

            {/* 2 per row grid, responsive */}
            <div className="grid grid-cols-2 gap-3 md:gap-4.5 mt-4 md:mt-4.5">
              {avatars.map((avatar) => (
                <motion.div
                  key={avatar.id}
                  className={`
                    ${
                      selectedAvatar === avatar.id
                        ? "border-[1.5px] border-blue-400 shadow-[0_0_5px_rgba(59,130,246,0.5)]"
                        : "border border-white/10"
                    } relative cursor-pointer rounded-xl overflow-hidden
                     border backdrop-blur-xl
                    transition-all duration-300
                    w-[110px] h-[105px]
                    sm:w-[130px] sm:h-[120px]
                    mx-auto bg-[#2d2d2d]`}
                  onClick={() => (
                    setURL(avatar.url),
                    setCurrentPos(avatar.posy),
                    setSelectedAvatar(avatar.id)
                  )}
                >
                  <img
                    src={avatar.img}
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-all duration-300 rounded-xl" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Drawer;
