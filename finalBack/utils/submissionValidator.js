class QuizSubmissionValidator {
  constructor(db) {
    this.db = db;
  }

  /**
   * Validate a quiz submission
   * @param {number} quizId - ID of the quiz being submitted
   * @param {number} userId - ID of the user submitting
   * @param {Object} answers - User's answers { questionId: answer }
   * @returns {Promise<{ isValid: boolean, errors: string[], maxScore?: number }>}
   */
  async validateQuizSubmission(quizId, userId, answers) {
    const errors = [];
    let maxScore = 0;

    // 1. Basic validation of parameters
    if (!quizId || !userId || !answers) {
      errors.push("Missing required parameters");
      return { isValid: false, errors };
    }

    // 2. Check if quiz exists and get related data
    const quiz = await this.db.quizzes.findByPk(quizId, {
      include: [
        {
          model: this.db.lessons,
          include: [
            {
              model: this.db.modules,
              include: [
                {
                  model: this.db.courses,
                },
              ],
            },
          ],
        },
      ],
    });

    if (!quiz) {
      errors.push("Quiz not found");
      return { isValid: false, errors };
    }

    // 3. Verify user enrollment in the course
    const enrollment = await this.db.enrollments.findOne({
      where: {
        user_id: userId,
        course_id: quiz.lesson.module.course_id,
      },
    });

    if (!enrollment) {
      errors.push("You are not enrolled in this course");
    }

    // 4. Check for existing submission (prevent duplicate submissions)
    const existingSubmission = await this.db.quiz_submissions.findOne({
      where: {
        quiz_id: quizId,
        user_id: userId,
      },
    });

    if (existingSubmission) {
      errors.push("You have already submitted this quiz");
    }

    // 5. Get all questions for this quiz
    const questions = await this.db.questions.findAll({
      where: { quiz_id: quizId },
      order: [["id", "ASC"]],
    });

    // 6. Validate each answer
    for (const question of questions) {
      maxScore += question.score;

      if (!(question.id in answers)) {
        errors.push(`Missing answer for question ${question.order}`);
        continue;
      }

      const answer = answers[question.id];
      const options = question.options;

      if (!options.includes(answer)) {
        errors.push(`Invalid answer for question ${question.order}`);
      }
    }

    // 7. Check for extra answers that don't belong to questions
    const questionIds = questions.map((q) => q.id);
    const extraAnswers = Object.keys(answers).filter(
      (key) => !questionIds.includes(parseInt(key))
    );

    if (extraAnswers.length > 0) {
      errors.push(
        `Received answers for non-existent questions: ${extraAnswers.join(
          ", "
        )}`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      maxScore, // Return the maximum possible score for this quiz
    };
  }
}

module.exports = QuizSubmissionValidator;
