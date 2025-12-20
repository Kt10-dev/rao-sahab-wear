// src/components/RiveYeti.js
import React, { useEffect } from "react";
import {
  useRive,
  useStateMachineInput,
  Layout,
  Fit,
  Alignment,
} from "@rive-app/react-canvas";
import { Box } from "@chakra-ui/react";

const RiveYeti = ({
  isPasswordFocused,
  isChecking,
  inputLength,
  triggerSuccess,
  triggerFail,
}) => {
  const { rive, RiveComponent } = useRive({
    src: "https://public.rive.app/community/runtime-files/2244-4437-animated-login-screen.riv",
    stateMachines: "State Machine 1",
    layout: new Layout({
      fit: Fit.Cover,
      alignment: Alignment.Center,
    }),
    autoplay: true,
  });

  // State Machine Inputs
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
  const trigFailInput = useStateMachineInput(
    rive,
    "State Machine 1",
    "trigFail"
  );
  const numLookInput = useStateMachineInput(rive, "State Machine 1", "numLook");

  // React State changes hone par Rive inputs update karo
  useEffect(() => {
    if (rive) {
      if (isHandsUpInput) isHandsUpInput.value = isPasswordFocused;
      if (isCheckingInput) isCheckingInput.value = isChecking;
      if (numLookInput) numLookInput.value = inputLength * 2; // Aankhein ghumane ke liye
    }
  }, [
    rive,
    isPasswordFocused,
    isChecking,
    inputLength,
    isHandsUpInput,
    isCheckingInput,
    numLookInput,
  ]);

  // Success/Fail Triggers
  useEffect(() => {
    if (triggerSuccess && trigSuccessInput) {
      trigSuccessInput.fire();
    }
    if (triggerFail && trigFailInput) {
      trigFailInput.fire();
    }
  }, [triggerSuccess, triggerFail, trigSuccessInput, trigFailInput]);

  return (
    <Box h="200px" w="100%" mb={-10} mt={-10}>
      <RiveComponent />
    </Box>
  );
};

export default RiveYeti;
