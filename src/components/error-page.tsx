
export default function ErrorPage() {
  return (
    <section className="main bg-main-primary area relative min-h-[100vh]">
      <ul className="circles">
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
      </ul>
      <span className="absolute w-full h-full glass-effect">
      </span>

      <div className="relative min-h-[100vh] flex justify-center items-center flex-col gap-5">
        <h1 className="text-accent text-6xl font-bold">Oops..</h1>
        <p className="text-accent text-xl">404 Not Found</p>
      </div>
    </section>
  );
}