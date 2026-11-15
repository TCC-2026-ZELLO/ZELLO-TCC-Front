import { describe, expect, it } from "vitest";
import { safeUrl } from "./safeUrl";

describe("safeUrl (v5.0.0-1.2.2)", () => {
    it("mantém URLs http(s) e blob", () => {
        expect(safeUrl("https://conta.blob.core.windows.net/fotos/a.png")).toBe(
            "https://conta.blob.core.windows.net/fotos/a.png",
        );
        expect(safeUrl("blob:http://localhost/123")).toBe("blob:http://localhost/123");
    });

    it("descarta esquemas perigosos e valores vazios", () => {
        expect(safeUrl("javascript:alert(1)")).toBe("#");
        expect(safeUrl(" JaVaScRiPt:alert(1)")).toBe("#");
        expect(safeUrl("data:text/html;base64,PHNjcmlwdD4=")).toBe("#");
        expect(safeUrl("vbscript:msgbox(1)")).toBe("#");
        expect(safeUrl(undefined)).toBe("#");
        expect(safeUrl("", "")).toBe("");
    });
});
