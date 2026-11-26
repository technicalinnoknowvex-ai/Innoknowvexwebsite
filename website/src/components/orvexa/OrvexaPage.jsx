"use client";

import OrvexaClient from "@technicalinnoknowvex-ai/orvexa/client";
import Header from "../layout/Header/Header";
import {
  clearAuthStorage,
  getStudentPortfolio,
  updateStudentPortfolio,
} from "../../lib/auth-api";
import * as assistantApi from "../../lib/assistant-api";

const authApi = {
  clearAuthStorage,
  getStudentPortfolio,
  updateStudentPortfolio,
};

function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem("innoknowvex_access_token");
}

export default function OrvexaPage() {
  return (
    <OrvexaClient
      Header={Header}
      authApi={authApi}
      assistantApi={assistantApi}
      getAccessToken={getAccessToken}
    />
  );
}
