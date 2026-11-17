import React from "react";

export default function Overlays() {
  return <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: "<div aria-live=\"polite\" class=\"toasts\" id=\"toasts\" role=\"status\"></div><div id=\"modalRoot\"></div>" }} />;
}
