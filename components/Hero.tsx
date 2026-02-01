export default function Hero() {
  return (
    <div className="relative h-[45vh] sm:h-[50vh] md:h-[55vh] w-full -mt-14 sm:-mt-16">
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/55 dark:from-white/15 dark:to-black/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
        <div className="max-w-3xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent leading-tight">
            {/* Faithful Learning for a Faithful Life */}
            Expand Your Knowledge with Our Courses
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
            I don't want this text
          </p>
        </div>
      </div>
    </div>
  );
}
