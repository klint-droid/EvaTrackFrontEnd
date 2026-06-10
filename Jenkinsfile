pipeline {
    agent any

    /* Optional: Specify Node.js tool version configured in Jenkins settings */
    // tools {
    //     nodejs 'Node20'
    // }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Environment') {
            steps {
                bat 'node -v'
                bat 'npm -v'
            }
        }

        stage('Frontend - Code Quality') {
            steps {
                echo 'Installing dependencies...'
                bat 'npm ci'

                echo 'Running static analysis lint...'
                bat 'npm run lint'

                echo 'Compiling production build...'
                bat 'npm run build'
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Frontend lint & build passed successfully!'
        }
        failure {
            echo 'Frontend lint/build failed!'
        }
    }
}
