import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@/constants";
import { Trash, UploadCloud } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { UploadWidgetProps, UploadWidgetValue } from "@/types";

function UploadWidget({
  value = null,
  onChange,
  onError,
  disabled = false,
}: UploadWidgetProps) {
  const widgetRef = useRef<CloudinaryWidget | null>(null);
  const onChangeRef = useRef(onChange);
  const onErrorRef = useRef(onError);

  const [preview, setPreview] = useState<UploadWidgetValue | null>(value);
  const [deleteToken, setDeleteToken] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [widgetError, setWidgetError] = useState<string | null>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    setPreview(value);
    if (!value) {
      setDeleteToken(null);
    }
  }, [value]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const MAX_RETRIES = 8;
    const BASE_DELAY_MS = 300;
    let retryCount = 0;
    let timeoutId: number | null = null;
    let disposed = false;

    const reportWidgetError = (error: Error) => {
      setWidgetError(error.message);
      onErrorRef.current?.(error);
    };

    const initializeWidget = () => {
      if (!window.cloudinary || widgetRef.current) return false;

      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName: CLOUDINARY_CLOUD_NAME,
          uploadPreset: CLOUDINARY_UPLOAD_PRESET,
          multiple: false,
          folder: "uploads",
          maxFileSize: 5_000_000,
          clientAllowedFormats: ["png", "jpg", "jpeg"],
        },
        (error, result) => {
          if (!error && result.event === "success") {
            const payload: UploadWidgetValue = {
              url: result.info.secure_url,
              publicId: result.info.public_id,
            };

            setPreview(payload);
            setDeleteToken(result.info.delete_token ?? null);
            onChangeRef.current?.(payload);
          }
        },
      );

      setWidgetError(null);
      return true;
    };

    const attemptInitialize = () => {
      if (disposed) return;

      if (initializeWidget()) return;

      retryCount += 1;
      if (retryCount >= MAX_RETRIES) {
        reportWidgetError(
          new Error(
            "Cloudinary widget failed to load. Please refresh and try again.",
          ),
        );
        return;
      }

      // Linear backoff to avoid hammering while the script is still loading.
      const nextDelay = BASE_DELAY_MS + retryCount * 200;
      timeoutId = window.setTimeout(attemptInitialize, nextDelay);
    };

    attemptInitialize();

    return () => {
      disposed = true;
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  const openWidget = () => {
    if (!disabled) {
      widgetRef.current?.open();
    }
  };

  const removeFromCloudinary = async () => {
    if (!preview) return;

    setIsRemoving(true);

    try {
      if (deleteToken) {
        const params = new URLSearchParams();
        params.append("token", deleteToken);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/delete_by_token`,
          {
            method: "POST",
            body: params,
          },
        );

        if (!response.ok) {
          throw new Error(
            `Cloudinary delete failed with status ${response.status}`,
          );
        }
      }

      setPreview(null);
      setDeleteToken(null);
      onChangeRef.current?.(null);
    } catch (error) {
      console.error("Failed to remove image from Cloudinary", error);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="space-y-2">
      {widgetError ? (
        <p className="text-sm text-destructive" role="alert">
          {widgetError}
        </p>
      ) : null}
      {preview ? (
        <div className="upload-preview">
          <img src={preview.url} alt="Uploaded file" />

          <Button
            type="button"
            size="icon"
            variant="destructive"
            onClick={removeFromCloudinary}
            disabled={isRemoving || disabled}
          >
            <Trash className="size-4" />
          </Button>
        </div>
      ) : (
        <div
          className="upload-dropzone"
          role="button"
          tabIndex={0}
          onClick={openWidget}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openWidget();
            }
          }}
        >
          <div className="upload-prompt">
            <UploadCloud className="icon" />
            <div>
              <p>Click to upload photo</p>
              <p>PNG, JPG up to 5MB</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadWidget;
