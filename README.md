=============================== Fix 1 ====================================
1. Currently whether a user is a student or teacher, it is asked after login. The login page should have the radio button whether a user is a student/teacher. 

=============================== Feature 1 ================================
2. The students can communicate with the teacher through a messaging option. The messaging portal have several feature. It should have chatting, emoji, Audio & video calls, Screen Sharing, sending Attachements. basically every modern messaging features should be there. 

=============================== Feature 2 ================================
3. The teacher can take a proctored exam. When ever a student clicks the exam option "BatchSidebar.jsx"
        {isTeacher && (
          <ToolButton icon={Users} tone="indigo" label={t("students")}
            badge={batch.student_count} onClick={() => onOpen("students")} />
        )}
        <ToolButton icon={ClipboardCheck} tone="emerald"
          label={isTeacher ? t("attendance") : t("myAttendance")}
          onClick={() => onOpen("attendance")} />
        <ToolButton icon={BarChart3} tone="violet" label={t("results")}
          onClick={() => onOpen("results")} />
        <ToolButton icon={Calendar} tone="sky" label={t("routine")}
          onClick={() => onOpen("routine")} />
        <ToolButton icon={Wallet} tone="amber"
          label={isTeacher ? t("fee") : t("myFee")} onClick={() => onOpen("fee")} />
Here there'll be another ToolButton named Exam, it'll open a new tab where the interface will be like Google Meet, but it will have some features
- A student must be on full screen mode, the entire screen will be recorded. 
- Must keep the camera, microphone turned on
- It will take random screenshot throughout the exam
- The teacher must have to be present in order for the exam to be conducted, if the teacher get's disconnected the entire exam operation is freezed.

# It's up to the teacher, the teacher can take MCQ exam as well as written exam. 

=============================== Feature 3 =================================

4. A teacher can make AI based questions based on his materials with the help of Llama 4. basically we want to host Llama 4 in our website so that the teachers can use it. 
