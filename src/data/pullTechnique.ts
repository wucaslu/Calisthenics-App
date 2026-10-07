import type { TechniqueGuidance, TechniqueSource } from "@/types/skill";

export const pullTechniqueSources: Record<string, TechniqueSource> = {
  "pull-rr-pullup": {
    title:
      "Bodyweight Fitness: pull-up form and variations (public wiki mirror)",
    url: "https://raw.githubusercontent.com/asdjflk/r/da02f88bc4534b50f12895465a87748d62a34425/bodyweightfitness/wiki/exercises/pullup.md",
  },
  "pull-rr-row": {
    title:
      "Bodyweight Fitness: rows and front-lever pulling (public wiki mirror)",
    url: "https://raw.githubusercontent.com/asdjflk/r/da02f88bc4534b50f12895465a87748d62a34425/bodyweightfitness/wiki/exercises/row.md",
  },
  "pull-gym-rings": {
    title:
      "GymnasticBodies: ring hangs and back-lever curriculum (public mirror)",
    url: "https://raw.githubusercontent.com/tlchatt/gymnasticbodies.com/e932443104bbe86f6bf7acb1e710baad5398bfe3/data/workout/programCurricula.json",
  },
  "pull-ring-muscle-up": {
    title: "Free Exercise DB: ring muscle-up instructions",
    url: "https://raw.githubusercontent.com/yuhonas/free-exercise-db/f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5/exercises/Muscle_Up.json",
  },
};

const adapted = (family: string) =>
  `Adapted from ${family} mechanics; the linked guides do not demonstrate this exact variant.`;

function frontLeverHold(
  shape: string,
  shapeCue: string,
  shapeMistake: string,
): TechniqueGuidance {
  return {
    setup: [
      `Use a secure overhead bar or rings with clearance below you. Enter a controlled ${shape} with your torso facing upward beneath the handles.`,
    ],
    cues: [
      shapeCue,
      "Keep both elbows straight and actively pull down through the handles rather than hanging from bent arms.",
      "Hold the shoulders and hips at the same height; brace the abdomen and keep the shoulder blades controlled without shrugging.",
      "Return through a shorter lever or controlled hang before the horizontal position breaks.",
    ],
    mistakes: [
      shapeMistake,
      "Bending the elbows, swinging into the position, or letting the hips drop below shoulder height.",
    ],
    sources: ["pull-rr-row"],
    sourceScope: adapted("front-lever"),
  };
}

function backLeverHold(
  shape: string,
  shapeCue: string,
  shapeMistake: string,
): TechniqueGuidance {
  return {
    setup: [
      `From a controlled inverted hang on secure rings or a fixed bar, lower slowly into a ${shape}. Keep room for a controlled return through the tuck.`,
    ],
    cues: [
      shapeCue,
      "Keep the elbows straight and press down through the handles to support the horizontal torso with the arms behind you.",
      "Keep the shoulders, hips, and the intended leg shape level; maintain abdominal and glute tension without forcing the lower back into an arch.",
      "Keep your grip settled throughout the hold and return under control before losing shoulder position.",
    ],
    mistakes: [
      shapeMistake,
      "Dropping abruptly into shoulder extension or resting the upper arms against the torso to prop up the hold.",
    ],
    sources: ["pull-gym-rings"],
    sourceScope:
      "The source demonstrates rings. On a fixed bar, the grip cannot rotate; keep it settled and use only shoulder extension you can control.",
  };
}

function frontLeverRow(shape: string, shapeCue: string): TechniqueGuidance {
  return {
    setup: [
      `Establish a still ${shape} under secure rings or a fixed bar, with enough clearance to pull the chest toward the handles.`,
    ],
    cues: [
      shapeCue,
      "Bend the elbows to row the chest upward while the hips remain at shoulder height; this is a bent-arm row, not a straight-arm lever raise.",
      "Pull the shoulder blades back without shrugging and keep the trunk rigid through the top position.",
      "Lower slowly to straight elbows while preserving the same leg shape and horizontal torso.",
    ],
    mistakes: [
      "Dropping or lifting the hips to shorten the pull instead of moving the chest with the elbows.",
      "Changing the tuck or leg position midway through the repetition, or bouncing off the bottom.",
    ],
    sources: ["pull-rr-row"],
    sourceScope: adapted("front-lever and horizontal-row"),
  };
}

function oneArmPull(grip: string, negative: boolean): TechniqueGuidance {
  return {
    setup: [
      negative
        ? `Establish the top position on a secure handle using a ${grip}. Release the other hand before beginning the descent and keep a controlled exit within reach.`
        : `Begin from a still straight-arm hang on one secure handle using a ${grip}, with the other hand completely released.`,
    ],
    cues: [
      negative
        ? "Lower gradually from chin-over-hand through the complete elbow extension; keep control especially through the final part of the descent."
        : "Initiate with controlled shoulder movement, then bend the working elbow to bring the chin above the gripping hand.",
      "Keep the working shoulder controlled and the free hand off the handle, wrist, and working arm.",
      "Brace the trunk and manage any natural rotation without kicking, twisting sharply, or swinging.",
      negative
        ? "End the descent deliberately and reset before the next attempt; do not drop when the arm straightens."
        : "Lower to a straight elbow at the same controlled tempo and practice both sides separately.",
    ],
    mistakes: [
      "Using the free hand or leg drive to complete the movement, making it a different exercise.",
      negative
        ? "Falling through the lower half or hanging abruptly on a relaxed working shoulder."
        : "Craning the neck to reach the top or allowing the bottom position to turn into an uncontrolled drop.",
    ],
    sources: ["pull-rr-pullup"],
    sourceScope: adapted("unilateral pulling and pull-up"),
  };
}

function oneArmRow(straddle: boolean): TechniqueGuidance {
  return {
    setup: [
      `Grip one low ring or a suitable fixed bar with one hand and release the other. Keep both feet grounded ${straddle ? "in a wide straddle" : "with the legs together"} at a body angle you can control.`,
    ],
    cues: [
      `Maintain a straight line from shoulders through hips to feet and keep ${straddle ? "the same wide stance" : "the narrow, legs-together stance"} for the whole repetition.`,
      "Row the gripping hand toward the side of the chest with the working elbow tracking back.",
      "Keep the hips and chest square by bracing the abdomen; the free arm stays clear of the handle.",
      "Return slowly to a straight working elbow without changing the body angle or shrugging the shoulder.",
    ],
    mistakes: [
      "Rotating the torso toward the handle or lifting the hips to complete the pull.",
      `Using the free hand, moving the feet during the repetition, or ${straddle ? "narrowing the stance before you can maintain control" : "spreading the feet and turning it into the straddle variation"}.`,
    ],
    sources: ["pull-rr-row"],
    sourceScope: adapted("one-arm-row"),
  };
}

export const pullTechnique: Record<string, TechniqueGuidance> = {
  "dead-hang": {
    setup: [
      "Grip a secure overhead bar with the whole hand, or use securely mounted rings. Leave clear space beneath your feet and a stable way to step down.",
    ],
    cues: [
      "Let the elbows straighten while keeping a secure grip around the handle.",
      "Let the shoulders settle into a comfortable overhead position; do not force them downward or force a deeper stretch.",
      "Keep the body still, breathe normally, and step down before the grip opens.",
    ],
    mistakes: [
      "Swinging or making repeated grip adjustments while the fingers are slipping.",
      "Forcing a painful shoulder position or dropping from the bar when the grip fails.",
    ],
    sources: ["pull-rr-pullup"],
    sourceScope: adapted("hanging and pull-up"),
  },
  "scapular-pull-up": {
    setup: [
      "Start from a still, straight-arm hang on a secure bar or rings with the feet clear.",
    ],
    cues: [
      "Keep the elbows completely straight while drawing the shoulder blades down.",
      "Allow the chest to rise a small distance as the shoulders move away from the ears.",
      "Pause in the active position, then return to the starting hang under control.",
    ],
    mistakes: [
      "Bending the elbows to turn the movement into a partial pull-up.",
      "Kicking the legs or dropping abruptly back into the overhead hang.",
    ],
    sources: ["pull-rr-pullup"],
  },
  "inverted-row": {
    setup: [
      "Set secure rings or a suitable low fixed bar so you can row underneath with both feet grounded. Choose a body angle that allows the full pull.",
    ],
    cues: [
      "Keep a straight body line and brace the abdomen and glutes.",
      "Pull the chest toward the handles with the elbows tracking near the torso and the shoulder blades moving back.",
      "Lower to straight arms without letting the shoulders shrug or the hips sag.",
    ],
    mistakes: [
      "Thrusting the hips upward instead of pulling the chest to the handles.",
      "Stopping the descent with bent elbows or reaching with the chin instead of the chest.",
    ],
    sources: ["pull-rr-row"],
  },
  "pull-up": {
    setup: [
      "Take a comfortable overhand grip on a secure bar and begin from a still hang with straight elbows.",
    ],
    cues: [
      "Brace into a slight hollow body and pull by drawing the elbows down toward your sides.",
      "Bring the chin clearly above the bar while keeping the neck neutral.",
      "Lower under control to straight elbows without kicking or swinging the legs.",
    ],
    mistakes: [
      "Craning the neck over the bar or shortening the bottom range.",
      "Using a leg kick or excessive back arch to replace pulling strength.",
    ],
    sources: ["pull-rr-pullup"],
  },
  "pull-up-negative": {
    setup: [
      "Establish a stable chin-over-bar position on a secure bar and begin with the feet clear; use a stable step for the setup rather than swinging into place.",
    ],
    cues: [
      "Keep the chin above the bar at the start without craning the neck.",
      "Lower slowly and continuously while the elbows gradually straighten.",
      "Keep the body still and control the final return to the hang before stepping down.",
    ],
    mistakes: [
      "Holding the top briefly and then falling through the rest of the movement.",
      "Kicking, losing the shoulder position, or stopping before the elbows straighten.",
    ],
    sources: ["pull-rr-pullup"],
  },
  "chin-up": {
    setup: [
      "Begin from a still hang on a secure bar with the palms facing you and the elbows straight.",
    ],
    cues: [
      "Pull the elbows down toward the ribs while keeping the trunk braced.",
      "Bring the chin above the bar without reaching forward with the neck.",
      "Return under control to a straight-arm hang and keep the underhand grip unchanged.",
    ],
    mistakes: [
      "Using a leg kick or large torso swing to start the repetition.",
      "Shortening the bottom range or forcing an uncomfortable fixed grip width.",
    ],
    sources: ["pull-rr-pullup"],
  },
  "ring-pull-up": {
    setup: [
      "Hang from securely mounted rings with equal strap lengths, straight elbows, and room above your head.",
    ],
    cues: [
      "Allow the handles to rotate naturally into a comfortable grip as you pull.",
      "Draw the elbows toward your sides and bring the chin above the handles while keeping the rings controlled.",
      "Lower to straight arms without swinging or separating the rings abruptly.",
    ],
    mistakes: [
      "Forcing the rings to stay in an uncomfortable fixed wrist position.",
      "Kicking the legs or pulling one handle much earlier than the other.",
    ],
    sources: ["pull-rr-pullup", "pull-gym-rings"],
    sourceScope: adapted("pull-up and ring-pulling"),
  },
  "l-sit-pull-up": {
    setup: [
      "Start in a straight-arm hang on a secure bar and lift both straight legs together to horizontal in front of you.",
    ],
    cues: [
      "Keep the knees straight and the legs horizontal for the complete repetition.",
      "Pull the chin above the bar while keeping the trunk braced and the neck neutral.",
      "Lower to straight elbows without dropping the feet or swinging the hips.",
    ],
    mistakes: [
      "Bending the knees or letting the legs fall below horizontal as the pull becomes difficult.",
      "Using a leg lift to create momentum instead of maintaining the L position.",
    ],
    sources: ["pull-rr-pullup"],
  },
  "chest-to-bar-pull-up": {
    setup: [
      "Use a secure fixed bar with room for the upper chest to approach it. Begin from a still straight-arm hang with an overhand grip.",
    ],
    cues: [
      "Pull the elbows down and back as the upper chest approaches the bar.",
      "Reach the upper chest to the bar with the neck neutral; chin clearance alone does not complete this milestone.",
      "Control the return to straight elbows without a kick or a large swing.",
    ],
    mistakes: [
      "Counting a chin-over-bar repetition when the chest remains below the bar.",
      "Craning the neck or using violent leg drive to make contact.",
    ],
    sources: ["pull-rr-pullup"],
  },
  "explosive-pull-up": {
    setup: [
      "Use a secure bar with overhead clearance. Start from a still active hang and a secure overhand grip.",
    ],
    cues: [
      "Create speed by pulling forcefully through the arms and back while bracing the trunk.",
      "Keep the grip secure and use a repeatable pulling path; this milestone emphasizes speed rather than a prescribed lower-chest bar contact.",
      "Lower deliberately and reset to a still hang before the next explosive pull.",
    ],
    mistakes: [
      "Using a large kip or knee drive as the main source of acceleration.",
      "Letting go of the bar or dropping uncontrolled after the fast pull.",
    ],
    sources: ["pull-rr-pullup"],
    sourceScope: adapted("strict pull-up"),
  },
  "high-pull-up": {
    setup: [
      "Use a secure fixed bar with clearance for a high pull. Begin from a still active hang with an overhand grip.",
    ],
    cues: [
      "Pull powerfully so the bar travels toward the lower chest or upper abdomen, beyond ordinary chin or upper-chest height.",
      "Let the elbows travel behind the torso near the top while keeping the bar close enough for a future transition.",
      "Control the descent and reset without kicking the legs or crashing the torso into the bar.",
    ],
    mistakes: [
      "Counting a fast chin-height repetition as a high pull without reaching the named torso height.",
      "Swinging far away from the bar or forcing contact by throwing the hips forward.",
    ],
    sources: ["pull-rr-pullup"],
    sourceScope: adapted("pull-up and high-pull"),
  },
  "muscle-up": {
    setup: [
      "Use a secure fixed bar with enough space above it for straight-arm support. Begin below the bar with both hands gripping securely.",
    ],
    cues: [
      "Pull high with the bar close to your torso so you can bring the chest above it.",
      "Move both elbows over the bar together as the shoulders travel forward into the bottom of a straight-bar dip.",
      "Press to stable straight-arm support, then reverse the transition under control or use your planned exit.",
    ],
    mistakes: [
      "Throwing one elbow over first and twisting through a one-sided transition.",
      "Pulling away from the bar so the transition becomes a lunge or crash onto it.",
    ],
    sources: ["pull-rr-pullup", "pull-ring-muscle-up"],
    sourceScope: adapted("pull-up and muscle-up transition"),
  },
  "strict-muscle-up": {
    setup: [
      "Begin from a still hang beneath a secure fixed bar with sufficient overhead clearance and a grip that permits a controlled transition.",
    ],
    cues: [
      "Generate the high pull with the arms and back while the legs remain still; avoid a kip or hip snap.",
      "Keep the bar close and turn both elbows over together as the shoulders pass above it.",
      "Finish in straight-arm support and lower through the transition without losing the quiet body line.",
    ],
    mistakes: [
      "Using knee drive, a swing, or a hip snap while recording the repetition as strict.",
      "Turning one arm over before the other or dropping abruptly through the transition on the return.",
    ],
    sources: ["pull-rr-pullup", "pull-ring-muscle-up"],
    sourceScope: adapted("strict pulling and muscle-up transition"),
  },
  "false-grip-hang": {
    setup: [
      "Place the heel of each palm over the lower inside of a secure ring before loading the handles, then lift both feet clear for the suspended hold.",
    ],
    cues: [
      "Keep the wrist flexed so the heel of the palm, rather than the wrist crease alone, maintains contact with the ring.",
      "Maintain the false grip as the elbows straighten and the body becomes fully suspended.",
      "Keep the rings and body still, then step down before the grip slides to the fingers.",
    ],
    mistakes: [
      "Letting the hands roll into a normal finger grip while continuing to count false-grip time.",
      "Resting the wrists on the rings without a secure palm grip or forcing a painful wrist angle.",
    ],
    sources: ["pull-gym-rings"],
  },
  "ring-muscle-up": {
    setup: [
      "Start in a suspended false-grip hang on secure rings, with clear space for the chest and shoulders to pass above the handles.",
    ],
    cues: [
      "Pull the rings close toward the chest while preserving the false grip.",
      "Roll the shoulders forward over the hands and move both elbows backward as the rings stay near the armpits.",
      "Press from the bottom of the dip to stable straight-arm support without letting the rings spread apart.",
      "Reverse the transition slowly while maintaining control of both handles.",
    ],
    mistakes: [
      "Losing the false grip before the transition or allowing the rings to move far from the torso.",
      "Transitioning one arm at a time or finishing with bent elbows and unstable support.",
    ],
    sources: ["pull-ring-muscle-up", "pull-gym-rings"],
  },
  "skin-the-cat": {
    setup: [
      "Hang from secure rings with clear space around and below you. Begin with a compact tuck and a controlled route back out of the rotation.",
    ],
    cues: [
      "Draw both knees toward the chest and rotate slowly through an inverted hang.",
      "Keep a secure grip and let the rings rotate naturally as the arms travel behind the body.",
      "Enter only a shoulder-extension range you can actively control, then reverse the rotation with the same tuck and steady tempo.",
    ],
    mistakes: [
      "Dropping through the inverted position into a deep German hang without control.",
      "Using a kick to rotate or opening the legs before you can reverse the movement.",
    ],
    sources: ["pull-gym-rings", "pull-rr-row"],
    sourceScope: adapted("German-hang entry and controlled ring rotation"),
  },
  "german-hang": {
    setup: [
      "From a controlled inverted tuck on secure rings or a fixed bar, lower slowly until the arms are behind the torso. Keep both feet clear and a controlled return available.",
    ],
    cues: [
      "Straighten the elbows and settle only into a comfortable shoulder-extension range.",
      "On rings, let the handles rotate comfortably; on a fixed bar, keep your grip settled. Keep the chest open and hips extended without forcing extra depth.",
      "Hold the body still and return through the tuck before shoulder position or grip control changes.",
    ],
    mistakes: [
      "Dropping into the stretch or forcing the shoulders deeper than you can actively control.",
      "Bending the elbows, resting the feet, or arching the lower back to disguise the position.",
    ],
    sources: ["pull-gym-rings"],
  },
  "tuck-front-lever": {
    ...frontLeverHold(
      "compact tuck front lever",
      "Draw both knees close to the chest and keep the torso horizontal beneath the handles.",
      "Opening the tuck before you can hold the shoulder and hip height steady.",
    ),
    sourceScope: undefined,
  },
  "advanced-tuck-front-lever": frontLeverHold(
    "advanced tuck front lever",
    "Open the hip angle so the knees move away from the chest while both knees stay bent and the torso remains horizontal.",
    "Collapsing back into a compact tuck or lifting the knees by rounding the whole torso.",
  ),
  "straddle-front-lever": frontLeverHold(
    "straddle front lever",
    "Extend both knees and separate the legs in a controlled straddle while keeping the hips open and level with the shoulders.",
    "Bending the knees or piking the hips so the legs no longer share the horizontal body plane.",
  ),
  "half-lay-front-lever": frontLeverHold(
    "half-lay front lever",
    "Keep the torso and thighs in one horizontal line with open hips, legs together, and both knees equally bent.",
    "Tucking at the hips or extending only one knee instead of preserving the symmetrical half-lay.",
  ),
  "full-front-lever": frontLeverHold(
    "full front lever",
    "Extend both knees with the legs together and maintain one horizontal line from shoulders through hips to feet.",
    "Piking the hips, bending the knees, or sagging through the lower back to shorten the lever.",
  ),
  "front-lever-raise": {
    setup: [
      "Begin below secure rings or a bar in a still straight-arm hang and draw both knees into a compact tuck.",
    ],
    cues: [
      "Keep the elbows straight as you pull down through the handles to raise the tucked torso toward horizontal.",
      "Maintain the same tuck and move the shoulders and hips together without a leg kick.",
      "Pause in the horizontal tuck lever, then lower through the same path under control.",
    ],
    mistakes: [
      "Bending the elbows to turn the raise into a front-lever row.",
      "Swinging up from the hang or changing the tuck to get past a difficult part of the movement.",
    ],
    sources: ["pull-rr-row"],
  },
  "tuck-front-lever-row": frontLeverRow(
    "tuck front lever",
    "Keep both knees close to the chest and preserve the compact tuck as you pull.",
  ),
  "advanced-tuck-front-lever-row": frontLeverRow(
    "advanced tuck front lever",
    "Hold the knees away from the chest with the hip angle open and the back flat; do not collapse into a compact tuck during the row.",
  ),
  "full-front-lever-row": frontLeverRow(
    "full front lever",
    "Keep both knees straight and the legs together in a long horizontal line for the complete row.",
  ),
  "tuck-ice-cream-maker": {
    setup: [
      "Establish a controlled bent-arm top pull on secure rings or a bar, then keep both knees tucked for the whole movement.",
    ],
    cues: [
      "Extend the elbows as the tucked torso moves back into a horizontal straight-arm front lever.",
      "Keep the hips from sagging and preserve the same compact tuck as elbow angle and torso angle change together.",
      "Bend the elbows to return to the top pull without swinging or losing handle control.",
    ],
    mistakes: [
      "Throwing the hips backward and letting gravity carry the body through the lever.",
      "Keeping the elbows bent in the horizontal position or opening the tuck to create momentum.",
    ],
    sources: ["pull-rr-pullup", "pull-rr-row"],
    sourceScope: adapted("pull-up and front-lever"),
  },
  "tuck-back-lever": backLeverHold(
    "tuck back lever",
    "Keep both knees close to the chest and lower until the tucked torso is horizontal with the hips at shoulder height.",
    "Opening the tuck or lifting the hips above the shoulders to avoid the horizontal hold.",
  ),
  "advanced-tuck-back-lever": {
    ...backLeverHold(
      "advanced tuck back lever",
      "Keep both knees bent but open the hip angle so the knees move away from the chest; preserve a flat horizontal torso.",
      "Collapsing the knees against the chest or piking the hips instead of holding the longer open-tuck shape.",
    ),
    sourceScope: adapted("open-tuck back-lever"),
  },
  "straddle-back-lever": backLeverHold(
    "straddle back lever",
    "Straighten both knees into a wide straddle and keep the hips open so the torso and legs share a horizontal plane.",
    "Piking the hips or bending the knees to reduce the load while counting a straight-leg straddle hold.",
  ),
  "half-lay-back-lever": backLeverHold(
    "half-lay back lever",
    "Keep the hips fully open, thighs horizontal, and legs together with both knees equally bent; brace the glutes to hold the thigh line.",
    "Tucking at the hips, separating the legs, or bending one knee differently from the other.",
  ),
  "back-lever": backLeverHold(
    "full back lever",
    "Hold both knees straight and the legs together in one horizontal line from shoulders to feet.",
    "Letting the hips sag, piking the body, or arching the lower back instead of maintaining the long straight line.",
  ),
  "pelican-curl": {
    setup: [
      "Use secure low rings and begin in a straight-body, feet-grounded ring support with the toes on the floor. Choose a ring height and body angle that allow controlled shoulder extension.",
    ],
    cues: [
      "Keep the feet grounded and the trunk rigid as the arms travel behind the torso during the lowering phase.",
      "Extend the elbows gradually and stop the descent within a shoulder range you can reverse without dropping or bouncing.",
      "Curl the torso back toward the rings by bending the elbows while maintaining the same body angle and quiet feet.",
    ],
    mistakes: [
      "Letting the hips fold, using a leg push, or lifting the feet to turn it into a different exercise.",
      "Dropping into end-range shoulder extension or forcing the elbows straight beyond the range you can control.",
    ],
    sources: ["pull-rr-row", "pull-gym-rings"],
    sourceScope: adapted("feet-grounded ring pulling and shoulder-extension"),
  },
  "hefesto-negative": {
    setup: [
      "Establish stable support above a secure fixed bar with an underhand grip and plan a controlled exit before lowering behind it.",
    ],
    cues: [
      "Keep both hands fixed and move the torso slowly behind the bar as the elbows begin to bend.",
      "Control the following elbow extension as the arms move behind the body; stop within a shoulder range you can actively manage.",
      "Keep the body quiet and exit deliberately instead of dropping into a deep behind-the-body hang.",
    ],
    mistakes: [
      "Falling through the transition as the elbows straighten or forcing extra shoulder-extension depth.",
      "Changing grip under load, twisting one shoulder first, or using a sudden swing to escape the bottom.",
    ],
    sources: ["pull-gym-rings"],
    sourceScope: adapted("controlled shoulder-extension and German-hang"),
  },
  hefesto: {
    setup: [
      "Use a secure fixed bar and an underhand grip in a controlled behind-the-body hang. Begin only from a shoulder-extension position you can actively hold and exit.",
    ],
    cues: [
      "Bend both elbows to pull the torso upward while the hands remain fixed behind you.",
      "Move both shoulders through the transition together as the chest rises above the bar; keep the body still rather than kicking.",
      "Finish by pressing into stable straight-arm support and reverse only through a controlled range.",
    ],
    mistakes: [
      "Starting from an uncontrolled deep stretch or jerking sharply through the first elbow bend.",
      "Turning one shoulder over first or relying on a large swing to reach support.",
    ],
    sources: ["pull-gym-rings"],
    sourceScope: adapted(
      "behind-the-body pulling and controlled shoulder-extension",
    ),
  },
  "archer-pull-up": {
    setup: [
      "Begin in a still hang from a secure fixed bar with a wider overhand grip that permits a controlled side-to-side pull.",
    ],
    cues: [
      "Pull the chest toward one hand while the opposite elbow stays straight and both hands remain on the bar.",
      "Keep the trunk braced and avoid using a swing to shift toward the working side.",
      "Return to a full hang under control and alternate sides with the same range.",
    ],
    mistakes: [
      "Bending the opposite elbow so both arms contribute like an ordinary wide pull-up.",
      "Twisting the torso or kicking the legs to reach the working hand.",
    ],
    sources: ["pull-rr-pullup"],
  },
  "ring-archer-pull-up": {
    setup: [
      "Hang from two securely mounted rings with equal straps and space to separate the handles without contacting surrounding equipment.",
    ],
    cues: [
      "Pull toward one ring while extending the opposite elbow and retaining both grips.",
      "Control the independent handles so the straight arm moves outward without an abrupt ring swing.",
      "Lower to a complete hang with the torso braced, then repeat on the other side.",
    ],
    mistakes: [
      "Keeping both elbows bent or releasing the opposite ring, changing the exercise.",
      "Letting the handles swing widely or twisting the body to substitute for the pull.",
    ],
    sources: ["pull-rr-pullup"],
    sourceScope: adapted("archer pull-up and ring-pulling"),
  },
  "typewriter-pull-up": {
    setup: [
      "Use a secure fixed bar with enough grip width for side-to-side travel. Pull up first and establish a stable position above the bar.",
    ],
    cues: [
      "Keep the chin above bar height as you move the chest from one hand toward the other.",
      "Extend the opposite elbow at each side while both hands remain securely gripping the bar.",
      "Control each transfer before lowering to a straight-arm hang.",
    ],
    mistakes: [
      "Dropping below the bar between sides instead of maintaining pulling height.",
      "Swinging across with the hips or transferring load abruptly into the extended arm.",
    ],
    sources: ["pull-rr-pullup"],
  },
  "one-arm-pull-up-negative": oneArmPull("pronated, palm-away grip", true),
  "one-arm-pull-up": oneArmPull("pronated, palm-away grip", false),
  "one-arm-chin-up-negative": oneArmPull(
    "supinated, palm-toward-you grip",
    true,
  ),
  "one-arm-chin-up": oneArmPull("supinated, palm-toward-you grip", false),
  "pull-over": {
    setup: [
      "Hang beneath a secure fixed bar with space above and behind it for the legs to rotate into support. Keep both feet clear throughout.",
    ],
    cues: [
      "Pull the chest toward the bar while lifting both legs upward under control.",
      "Bring the hips close to the bar as the legs pass over it, maintaining both grips through the rotation.",
      "Finish above the bar in stable straight-arm support without jumping from the floor.",
    ],
    mistakes: [
      "Throwing the legs over with an uncontrolled swing while the hips stay far from the bar.",
      "Using a jump from the ground or releasing a hand during the rotation.",
    ],
    sources: ["pull-rr-pullup"],
    sourceScope: adapted("pull-up and controlled bar rotation"),
  },
  "archer-row": {
    setup: [
      "Use secure low rings with both feet grounded and establish a straight-body row position at a manageable angle.",
    ],
    cues: [
      "Pull one ring toward the chest while keeping the opposite elbow straight and both hands gripping.",
      "Keep the torso and hips square as the straight arm extends outward.",
      "Return to straight elbows at the same body angle and alternate sides without shifting the feet.",
    ],
    mistakes: [
      "Bending both elbows so the movement becomes a regular two-arm row.",
      "Rotating the hips, sagging the trunk, or moving the feet to complete the repetition.",
    ],
    sources: ["pull-rr-row"],
  },
  "straddle-one-arm-row": oneArmRow(true),
  "one-arm-row": oneArmRow(false),
};
