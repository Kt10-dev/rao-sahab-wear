import React, { useEffect, useState } from "react";
import { useRive, useStateMachineInput } from "@rive-app/react-canvas";

const RiveAnimation = () => {
  // 1. Rive Hook Setup
  const { rive, RiveComponent } = useRive({
    src: "https://cdn.rive.app/animations/vehicles.riv", // Yeh generic hai, niche 'State Machine' wala specific link use karenge
    // Hum direct Yeti file load karenge niche code mein
    src: "https://public.rive.app/community/runtime-files/2244-4437-animated-login-screen.riv",
    stateMachines: "State Machine 1",
    autoplay: true,
  });

  // 2. State Machine Inputs ko control karne ke liye hooks
  // 'trigSuccess': Success hone par
  // 'trigFail': Fail hone par
  // 'isHandsUp': Password field ke liye (aankhein band karna)
  // 'isChecking': Email type karte waqt dekhna
  // 'numLook': Cursor position track karna

  const isCheckingInput = useStateMachineInput(
    rive,
    "State Machine 1",
    "isChecking"
  );
  const isHandsUpInput = useStateMachineInput(
    rive,
    "State Machine 1",
    "isHandsUp"
  );
  const trigSuccessInput = useStateMachineInput(
    rive,
    "State Machine 1",
    "trigSuccess"
  );
  const numLookInput = useStateMachineInput(rive, "State Machine 1", "numLook");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Logic: Jab Email ki length badhe toh bhalu ki aankhein ghumengi
  useEffect(() => {
    if (numLookInput && email.length > 0) {
      // Logic to move eyes based on input length
      numLookInput.value = email.length * 2;
    }
  }, [email, numLookInput]);

  // Handle Input Focus
  const onEmailFocus = () => {
    if (isCheckingInput) isCheckingInput.value = true;
    if (isHandsUpInput) isHandsUpInput.value = false;
  };

  const onPasswordFocus = () => {
    if (isHandsUpInput) isHandsUpInput.value = true;
    if (isCheckingInput) isCheckingInput.value = false;
  };

  // Handle Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    // Example logic: Agar password sahi hai toh Success, nahi toh Fail
    if (password.length > 5) {
      if (trigSuccessInput) trigSuccessInput.fire();
    } else {
      // Fail animation (optional triggers agar file me ho)
      // Usually Yeti file me 'trigFail' hota hai
      if (trigSuccessInput) trigSuccessInput.fire(); // Just showcasing success for now
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
      }}
    >
      {/* Animation Container */}
      <div style={{ width: "400px", height: "300px" }}>
        <RiveComponent />
      </div>

      {/* Form Fields */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          width: "300px",
        }}
      >
        <input
          type="text"
          placeholder="Username / Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={onEmailFocus}
          onBlur={() => isCheckingInput && (isCheckingInput.value = false)}
          style={{
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={onPasswordFocus}
          onBlur={() => isHandsUpInput && (isHandsUpInput.value = false)}
          style={{
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />

        <button
          type="submit"
          style={{
            padding: "10px",
            backgroundColor: "#4F46E5",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default RiveAnimation;
