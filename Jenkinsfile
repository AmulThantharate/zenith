pipeline {
  agent any 
  tools {
    nodejs "node25"
  }
  environment {
    SONAR_HOME = tool "sonar"
  }
  stages {
    stage('Initialize') {
      steps {
          script {
              echo "🚀 Starting pipeline for build #${BUILD_NUMBER}"
              echo "📌 Image Tag: ${IMAGE_TAG}"
              echo "🔀 Branch: ${env.BRANCH_NAME}"
              echo "✍️ Commit: ${env.GIT_COMMIT}"
          }
      }
    }
    stage("Checkout") {
      steps{
        git branch: "ci/jenkins", url: "https://github.com/AmulThantharate/zenith.git"
      }
    }
    stage("Imaeg Tag") {
      steps{
        script{
          env.IMAGE_TAG = sh(script: 'git log -1 --format="%h"', returnStdout: true).trim()
        }
      }
    }
  }
}