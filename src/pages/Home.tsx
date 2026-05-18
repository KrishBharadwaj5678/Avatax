import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Euler, Matrix4 } from "three";
import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";
import { avatars } from "../constants/avatars.tsx";
import { Palette } from "lucide-react";
import Drawer from "../components/Drawer.tsx";
import ColorPanel from "../components/ColorPanel.tsx";
import { useAvatar } from "../context/AvatarContext.tsx";
import { useColor } from "../context/ColorContext.tsx";
import Avatar from "../components/Avatar.tsx";
import { Html } from "@react-three/drei";
import { HashLoader } from "react-spinners";

function Home() {
  let { rotation, setRotation, blendShapes, setBlendShapes } = useAvatar();
  let { color, colorPickerPopUp, setColorPickerPopUp } = useColor();

  let [url, setURL] = useState<string>("models/5193831.glb");

  let [open, setOpen] = useState(false);
  let [currentPos, setCurrentPos] = useState(avatars[0].posy);
  let [selectedAvatar, setSelectedAvatar] = useState<string>(avatars[0].id);

  let video: HTMLVideoElement;
  let faceLandmarker: FaceLandmarker;
  let lastVideoTime = -1;

  let setup = async () => {
    let vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
    );

    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
        delegate: "GPU",
      },
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: true,
      runningMode: "VIDEO",
    });

    video = document.getElementById("video") as HTMLVideoElement;
    navigator.mediaDevices
      .getUserMedia({
        video: { width: 1280, height: 720 },
      })
      .then((stream) => {
        video.srcObject = stream;
        video.addEventListener("loadeddata", predict);
      });
  };

  let predict = () => {
    let nowInMs = Date.now();
    if (lastVideoTime !== video.currentTime) {
      lastVideoTime = video.currentTime;
      let result = faceLandmarker.detectForVideo(video, nowInMs);

      if (
        result.facialTransformationMatrixes &&
        result.facialTransformationMatrixes.length > 0 &&
        result.faceBlendshapes &&
        result.faceBlendshapes[0].categories.length > 0
      ) {
        let matrix = new Matrix4().fromArray(
          result.facialTransformationMatrixes![0].data,
        );

        rotation = new Euler().setFromRotationMatrix(matrix);
        blendShapes = result.faceBlendshapes[0].categories;
        setRotation(rotation);
        setBlendShapes(blendShapes);
      }
    }

    requestAnimationFrame(predict);
  };

  useEffect(() => {
    setup();
  }, []);

  return (
    <div className="min-h-screen text-center text-white bg-[#0f0f0f] flex flex-col justify-center items-center gap-3 relative w-full px-4 py-6">
      {/* Setting Icons */}
      <div
        className={`${
          colorPickerPopUp && "hidden"
        } absolute left-3 top-6 md:left-6 cursor-pointer text-white rounded-full bg-[#2A2D44] hover:bg-[#1D1F2F] p-4 transition-colors duration-200 z-100`}
        onClick={() => setOpen(!open)}
      >
        <svg
          className="w-7 h-7 text-white"
          viewBox="0 0 48 48"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g>
            <path d="M43.2497 39.62H5.44971C4.36971 39.62 3.33971 39.1 2.68971 38.24C2.13971 37.5 1.89971 36.59 2.02971 35.68C2.15971 34.77 2.63971 33.96 3.37971 33.41L23.0997 18.62C23.0997 18.62 23.1597 18.57 23.1997 18.55L28.0497 14.91C27.6797 13.41 26.4097 12.24 24.8197 12.04C23.8097 11.91 22.8097 12.19 21.9997 12.81C21.1997 13.43 20.6797 14.34 20.5597 15.35C20.4197 16.45 19.4297 17.23 18.3297 17.08C17.2297 16.94 16.4597 15.94 16.5997 14.85C17.1297 10.57 21.0397 7.52001 25.3197 8.06001C29.2197 8.55001 32.1597 11.88 32.1597 15.82C32.1597 16.45 31.8597 17.04 31.3597 17.42L27.6797 20.18L45.3097 33.41C46.1697 34.06 46.6897 35.09 46.6897 36.17C46.6897 38.07 45.1497 39.63 43.2397 39.63L43.2497 39.62ZM24.3497 22.68L7.08971 35.62H41.5997L24.3397 22.68H24.3497Z"></path>
          </g>
        </svg>
      </div>

      {/* Palette Icons */}
      <div
        className={`${
          colorPickerPopUp && "hidden"
        } absolute left-3 top-24.5 md:top-26 md:left-6 cursor-pointer text-white rounded-full bg-[#2A2D44] hover:bg-[#1D1F2F] p-4 transition-colors duration-200 z-100`}
        onClick={() => setColorPickerPopUp(!colorPickerPopUp)}
      >
        <Palette size={27} />
      </div>

      {/* Color Panel */}
      <ColorPanel />

      {/* Drawer */}
      <Drawer
        open={open}
        setOpen={setOpen}
        setURL={setURL}
        setCurrentPos={setCurrentPos}
        selectedAvatar={selectedAvatar}
        setSelectedAvatar={setSelectedAvatar}
      />

      <div className="bg-[#1a1a1a] w-full max-w-xl rounded-xl p-6 shadow-xl flex flex-col gap-5 border border-[#2a2a2a]">
        <div
          className="
    rounded-xl overflow-hidden border border-[#333] shadow-lg w-full h-[340px] md:h-[340px] lg:h-[300px]"
        >
          <video
            autoPlay
            id="video"
            className="w-full object-cover h-full opacity-90"
          />
        </div>

        <div className="rounded-xl overflow-hidden border border-[#333] shadow-lg">
          <Canvas
            style={{
              background: "rgba(255,255,255,0.17)",
              backdropFilter: "blur(12px)",
              height: 350,
            }}
            camera={{ fov: 25 }}
          >
            <ambientLight intensity={2} />

            <pointLight position={[2, 1, 2]} color={color} intensity={50} />

            <pointLight position={[-2, 1, -1]} color={color} intensity={50} />

            {/* Avatar */}
            <Suspense
              fallback={
                <Html center>
                  <HashLoader color="#4DAAED" />
                </Html>
              }
            >
              <Avatar url={url} currentPos={currentPos} />
            </Suspense>
          </Canvas>
        </div>
      </div>
    </div>
  );
}

export default Home;
