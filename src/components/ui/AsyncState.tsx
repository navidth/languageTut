type AsyncStateProps = {
  message: string;
  retry?: () => void;
  className?: string;
};

export default function AsyncState({ message, retry, className = "" }: AsyncStateProps) {
  return (
    <div
      className={`surface-card rounded-2xl p-10 text-center text-muted-foreground ${className}`}
      role={retry ? "alert" : "status"}
    >
      <p>{message}</p>
      {retry && (
        <button type="button" onClick={retry} className="brand-button mt-4 rounded-xl px-5 py-2">
          تلاش دوباره
        </button>
      )}
    </div>
  );
}
