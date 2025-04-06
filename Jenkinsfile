pipeline {
    agent {
      docker {
        image 'docker:24.0.5-cli'  // has Docker CLI but not daemon
        args '-v /var/run/docker.sock:/var/run/docker.sock'
      }
    }

    /*
     * Parameterize your pipeline for flexibility. This way, you can change
     * tags, environment variables, etc. directly in the Jenkins UI.
     */
    parameters {
        string(name: 'IMAGE_NAME', defaultValue: 'joeqi/cloud-crafter-lab', description: 'Docker image name')
        string(name: 'IMAGE_TAG', defaultValue: 'fe-1', description: 'Docker image tag')
        string(name: 'ENV_VARIABLE', defaultValue: 'your-env-value', description: 'Generic environment variable')
        string(name: 'NEXT_PUBLIC_API_URL', defaultValue: 'http://backend:8080/query', description: 'Public API URL for Next.js')
        string(name: 'PRIVATE_API_URL', defaultValue: 'http://backend:8080/query', description: 'Private API URL')
        string(name: 'EC2_HOST', defaultValue: 'ec2-user@<your-ec2-ip>', description: 'EC2 Host (e.g., ec2-user@1.2.3.4)')
    }

    environment {
        // Jenkins credentials IDs
        DOCKER_CREDS = 'docker-hub-credentials-id'
        SSH_CREDS = 'ec2-ssh-credentials-id'
    }

    stages {
        stage('Checkout') {
            steps {
              checkout scm
            }
        }

        stage('Build & Push Docker Image') {
            steps {
                /*
                 * Use Jenkins Docker pipeline steps:
                 * 1) docker.build to build the image,
                 * 2) docker.withRegistry to log in and push.
                 */
                script {
                    docker.withRegistry('', DOCKER_CREDS) {
                        def customImage = docker.build(
                            "${params.IMAGE_NAME}:${params.IMAGE_TAG}",
                            """
                              -f src/docker/Dockerfile \
                              --build-arg ENV_VARIABLE=${params.ENV_VARIABLE} \
                              --build-arg NEXT_PUBLIC_API_URL=${params.NEXT_PUBLIC_API_URL} \
                              --build-arg PRIVATE_API_URL=${params.PRIVATE_API_URL} \
                              .
                            """
                        )
                        customImage.push()
                    }
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                /*
                 * Use sshagent to manage SSH keys securely without writing them
                 * to local files. Ensure your Jenkins "SSH Username with private key"
                 * is configured with ID = ec2-ssh-credentials-id.
                 */
                sshagent(credentials: [SSH_CREDS]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${params.EC2_HOST} << EOF
                          docker pull ${params.IMAGE_NAME}:${params.IMAGE_TAG}
                          docker stop next-app || true
                          docker rm next-app || true
                          docker run -d --name next-app -p 3000:3000 \\
                            -e ENV_VARIABLE=${params.ENV_VARIABLE} \\
                            -e NEXT_PUBLIC_API_URL=${params.NEXT_PUBLIC_API_URL} \\
                            -e PRIVATE_API_URL=${params.PRIVATE_API_URL} \\
                            ${params.IMAGE_NAME}:${params.IMAGE_TAG}
                        EOF
                    """
                }
            }
        }
    }

    post {
        success {
            echo "Deployment completed successfully."
        }
        failure {
            echo "Deployment failed. Check the logs."
        }
    }
}
